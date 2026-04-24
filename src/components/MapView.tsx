/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Droplets, FlaskConical, Bug, Wind, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import type { Layer, PathOptions, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MunicipalityData {
  id: string;
  mun_code: number;
  name: string;
  ica_score: number;
  status: 'Safe' | 'Moderate' | 'Critical';
  clorof_a: number;
  p_tot: number;
  n_no3: number;
  od_porcentaje: number;
  pct_pipas: number;
}

type ViewMode = 'current' | 'predicted';

const STATUS_COLORS: Record<string, { fill: string; border: string }> = {
  Safe:     { fill: '#4CAF50', border: '#2E7D32' },
  Moderate: { fill: '#FFC107', border: '#F57F17' },
  Critical: { fill: '#F44336', border: '#B71C1C' },
};

const STATUS_LABEL: Record<string, string> = {
  Safe: 'Óptimo',
  Moderate: 'Regular',
  Critical: 'Crítico',
};

function getStatusFromScore(score: number): 'Safe' | 'Moderate' | 'Critical' {
  if (score >= 70) return 'Safe';
  if (score >= 50) return 'Moderate';
  return 'Critical';
}

export function MapView() {
  const [geojson, setGeojson] = useState<GeoJsonObject | null>(null);
  const [dataMap, setDataMap] = useState<Record<number, MunicipalityData>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('current');
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPred, setLoadingPred] = useState(false);
  const [predMap, setPredMap] = useState<Record<number, MunicipalityData>>({});
  const [selected, setSelected] = useState<MunicipalityData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const geoJsonLayerRef = useRef<any>(null);

  // Load GeoJSON and current data in parallel
  useEffect(() => {
    const fetchAll = async () => {
      setLoadingData(true);
      try {
        const [geoRes, dataRes] = await Promise.all([
          fetch('/jalisco.geojson'),
          fetch('/api/municipalities'),
        ]);
        if (!geoRes.ok) throw new Error('No se pudo cargar el mapa de Jalisco');
        if (!dataRes.ok) throw new Error('No se pudo cargar los datos del API');

        const geoData: GeoJsonObject = await geoRes.json();
        const muniData: MunicipalityData[] = await dataRes.json();

        const map: Record<number, MunicipalityData> = {};
        muniData.forEach(m => { map[m.mun_code] = m; });

        setGeojson(geoData);
        setDataMap(map);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error de red');
      } finally {
        setLoadingData(false);
      }
    };
    fetchAll();
  }, []);

  const fetchPredictions = async () => {
    if (Object.keys(predMap).length > 0) {
      setViewMode('predicted');
      return;
    }
    setLoadingPred(true);
    try {
      const res = await fetch('/api/predict');
      if (!res.ok) throw new Error('No se pudo obtener la predicción');
      const data: MunicipalityData[] = await res.json();
      const map: Record<number, MunicipalityData> = {};
      data.forEach(m => { map[m.mun_code] = m; });
      setPredMap(map);
      setViewMode('predicted');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al predecir');
    } finally {
      setLoadingPred(false);
    }
  };

  const activeData = viewMode === 'predicted' ? predMap : dataMap;

  const styleFeature = useCallback((feature?: Feature): PathOptions => {
    if (!feature?.properties) return { fillColor: '#ccc', color: '#999', weight: 1, fillOpacity: 0.7 };
    const munCode: number = feature.properties.mun_code;
    const d = activeData[munCode];
    if (!d) return { fillColor: '#ccc', color: '#999', weight: 1, fillOpacity: 0.7 };
    const colors = STATUS_COLORS[d.status];
    return {
      fillColor: colors.fill,
      color: colors.border,
      weight: 1.2,
      fillOpacity: 0.75,
    };
  }, [activeData]);

  const onEachFeature = useCallback((feature: Feature, layer: Layer) => {
    layer.on({
      click: (e: LeafletMouseEvent) => {
        const munCode: number = feature.properties?.mun_code;
        const d = activeData[munCode];
        if (d) setSelected(d);
      },
    });
  }, [activeData]);

  // Refresh GeoJSON layer styles when data or viewMode changes
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(styleFeature);
    }
  }, [styleFeature, viewMode]);

  const currentSelected = selected ? (activeData[selected.mun_code] ?? selected) : null;

  // Count by status
  const counts = (Object.values(activeData) as MunicipalityData[]).reduce(
    (acc, m) => { acc[m.status] = (acc[m.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-col h-screen pt-12 pb-0 bg-gradient-to-b from-[#E3F2FD] to-white overflow-hidden">
      {/* Header */}
      <div className="px-6 mb-3 flex-shrink-0">
        <h2 className="text-3xl font-black text-sleek-dark tracking-tight">Mapa Hídrico</h2>
        <p className="text-gray-500 font-medium text-sm">Estado de Jalisco — 125 municipios</p>
      </div>

      {/* Mode toggle */}
      <div className="px-6 mb-3 flex-shrink-0 flex gap-3 items-center">
        <button
          onClick={() => setViewMode('current')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'current'
              ? 'bg-[#2196F3] text-white shadow-lg shadow-blue-500/30'
              : 'bg-white/80 text-gray-500 border border-gray-200'
          }`}
        >
          Datos actuales
        </button>
        <button
          onClick={fetchPredictions}
          disabled={loadingPred || loadingData}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'predicted'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/80 text-gray-700 border border-gray-200 hover:border-purple-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loadingPred ? (
            <Loader2 size={12} className="animate-spin" />
          ) : viewMode === 'predicted' ? (
            <TrendingDown size={12} />
          ) : (
            <TrendingUp size={12} />
          )}
          Predicción 2027
        </button>

        {/* Status summary chips */}
        {!loadingData && (
          <div className="ml-auto flex gap-2">
            {(['Critical','Moderate','Safe'] as const).map(s => (
              <span key={s} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                s === 'Critical' ? 'bg-red-100 text-red-600' :
                s === 'Moderate' ? 'bg-amber-100 text-amber-600' :
                'bg-green-100 text-green-600'
              }`}>
                {counts[s] ?? 0}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative px-6 pb-2 min-h-0">
        <div className="w-full h-full rounded-[28px] overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/60">
          {loadingData ? (
            <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-blue-400" />
              <p className="text-sm font-medium text-gray-500">Cargando mapa...</p>
            </div>
          ) : error ? (
            <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-red-500 font-bold">Error al cargar</p>
              <p className="text-sm text-gray-500">{error}</p>
              <p className="text-xs text-gray-400">Asegúrate de que el backend esté corriendo en puerto 8000</p>
            </div>
          ) : geojson ? (
            <MapContainer
              center={[20.6, -103.3]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                opacity={0.4}
              />
              <GeoJSON
                key={viewMode}
                ref={geoJsonLayerRef}
                data={geojson}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            </MapContainer>
          ) : null}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-2 flex-shrink-0 flex justify-center gap-6">
        {[
          { label: 'Óptimo / Bueno', color: '#4CAF50' },
          { label: 'Regular', color: '#FFC107' },
          { label: 'Malo / Crítico', color: '#F44336' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: item.color }} />
            <span className="text-[10px] font-medium text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Municipality detail panel */}
      <AnimatePresence>
        {currentSelected && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-28 left-4 right-4 bg-white/97 backdrop-blur-xl border border-white rounded-[28px] shadow-2xl p-5 z-[1000]"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-black text-sleek-dark capitalize leading-tight">
                  {currentSelected.name.charAt(0) + currentSelected.name.slice(1).toLowerCase()}
                </h4>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block ${
                  currentSelected.status === 'Critical' ? 'bg-red-100 text-red-600' :
                  currentSelected.status === 'Moderate' ? 'bg-amber-100 text-amber-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {STATUS_LABEL[currentSelected.status]}
                  {' · '}ICA {currentSelected.ica_score}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Stat icon={<Droplets size={14} className="text-blue-500" />} label="Clorofila-a" value={`${currentSelected.clorof_a}`} unit="μg/L" />
              <Stat icon={<FlaskConical size={14} className="text-amber-500" />} label="Fósforo total" value={`${currentSelected.p_tot}`} unit="mg/L" />
              <Stat icon={<Bug size={14} className="text-red-500" />} label="Nitrato (NO₃)" value={`${currentSelected.n_no3}`} unit="mg/L" />
              <Stat icon={<Wind size={14} className="text-teal-500" />} label="Oxígeno disuelto" value={`${currentSelected.od_porcentaje}`} unit="%" />
            </div>

            {viewMode === 'predicted' && (
              <p className="text-[10px] text-purple-500 font-semibold mt-3 text-center uppercase tracking-wider">
                Proyección Random Forest — 2027
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-3">
      {icon}
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-sm font-bold text-sleek-dark leading-tight">
          {value} <span className="text-[10px] font-normal text-gray-400">{unit}</span>
        </p>
      </div>
    </div>
  );
}
