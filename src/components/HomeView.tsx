/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ChevronDown, X, Search } from 'lucide-react';
import { WaterStatus } from '../types.ts';

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

interface HomeViewProps {
  setStatus: (status: WaterStatus) => void;
  currentStatus: WaterStatus;
}

const STATUS_LABEL: Record<string, string> = {
  Safe: 'Óptimo',
  Moderate: 'Regular',
  Critical: 'Crítico',
};

const RECOMMENDATIONS: Record<WaterStatus, Array<{ id: string; emoji: string; text: string; tips: string[] }>> = {
  Safe: [
    {
      id: 'conserva',
      emoji: '💧',
      text: 'Conserva el agua',
      tips: [
        'Cierra la llave mientras te cepillas los dientes.',
        'Repara fugas en llaves y tuberías rápidamente.',
        'Limita las duchas a 5 minutos con regadera eficiente.',
        'Reutiliza el agua de cocinar vegetales para regar plantas.',
      ],
    },
    {
      id: 'reporta',
      emoji: '📋',
      text: 'Reporta fugas',
      tips: [
        'Documenta con foto cualquier fuga o derrame visible.',
        'Reporta al organismo operador de agua de tu municipio.',
        'Anota la dirección exacta y magnitud de la fuga.',
      ],
    },
    {
      id: 'eficiencia',
      emoji: '♻️',
      text: 'Usa eficientemente',
      tips: [
        'Instala dispositivos ahorradores en llaves y regaderas.',
        'Usa lavadora y lavavajillas con ciclos de ahorro.',
        'Recoge agua de lluvia para usos no potables como riego.',
      ],
    },
  ],
  Moderate: [
    {
      id: 'filtra',
      emoji: '🚰',
      text: 'Filtra el agua',
      tips: [
        'Usa filtro certificado NSF o de ósmosis inversa para consumo.',
        'Reemplaza los cartuchos del filtro según las instrucciones.',
        'Hierve el agua al menos 1 minuto si no tienes filtro disponible.',
      ],
    },
    {
      id: 'monitorea',
      emoji: '📊',
      text: 'Monitorea consumo',
      tips: [
        'Evita beber agua directamente del grifo hasta nueva evaluación.',
        'Revisa regularmente el estado del agua en esta app.',
        'Consulta los reportes del organismo operador de tu municipio.',
      ],
    },
    {
      id: 'cambios',
      emoji: '⚠️',
      text: 'Reporta cambios',
      tips: [
        'Si notas cambio de color, olor o sabor, repórtalo de inmediato.',
        'Usa el botón de Reportar Estado en esta app.',
        'Contacta a CONAGUA o SEMADET Jalisco ante cualquier anomalía.',
      ],
    },
  ],
  Critical: [
    {
      id: 'hervir',
      emoji: '🔥',
      text: 'Hervir antes de usar',
      tips: [
        'Hierve el agua al menos 1 minuto completo antes de beberla o cocinar.',
        'Deja enfriar en recipiente limpio y tapado.',
        'No hagas hielos con esta agua hasta que mejore la calidad.',
      ],
    },
    {
      id: 'embotellada',
      emoji: '🛒',
      text: 'Agua embotellada',
      tips: [
        'Usa agua embotellada certificada para consumo humano.',
        'Verifica que el sello esté completamente intacto.',
        'Considera garrafón como medida temporal hasta normalización.',
      ],
    },
    {
      id: 'autoridades',
      emoji: '🚨',
      text: 'Contactar autoridades',
      tips: [
        'Llama a CONAGUA al 800 900 0800 para reportar la situación.',
        'Contacta a tu organismo operador municipal.',
        'Evita el contacto dérmico prolongado con el agua.',
      ],
    },
  ],
};

function displayName(name: string): string {
  return name.charAt(0) + name.slice(1).toLowerCase();
}

export function HomeView({ setStatus, currentStatus }: HomeViewProps) {
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [selected, setSelected] = useState<MunicipalityData | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [activeRec, setActiveRec] = useState<(typeof RECOMMENDATIONS.Safe)[0] | null>(null);

  useEffect(() => {
    fetch('/api/municipalities')
      .then(r => r.json())
      .then((data: MunicipalityData[]) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setMunicipalities(sorted);
        const gdl = sorted.find(m => m.mun_code === 39) ?? sorted[0];
        if (gdl) {
          setSelected(gdl);
          setStatus(gdl.status);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = municipalities.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const recs = RECOMMENDATIONS[currentStatus];

  return (
    <div className="px-6 pt-12 pb-8 space-y-6">
      {/* Location selector */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm flex-shrink-0">
          <MapPin className="text-[#2196F3]" size={20} />
        </div>
        <button onClick={() => setShowPicker(true)} className="flex items-center gap-2 flex-1 text-left">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest truncate">
              📍 {selected ? displayName(selected.name) : 'Cargando...'}
            </h2>
            <p className="text-[12px] font-medium opacity-60">Toca para cambiar municipio</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* Municipality picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center pb-[88px] px-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowPicker(false); setSearch(''); }} />
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[28px] p-5 shadow-2xl max-h-[70vh] flex flex-col z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">Seleccionar municipio</h3>
                <button onClick={() => { setShowPicker(false); setSearch(''); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 mb-3">
                <Search size={16} className="text-gray-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar municipio..."
                  className="bg-transparent outline-none flex-1 text-sm font-medium"
                />
              </div>
              <div className="overflow-y-auto flex-1 space-y-0.5">
                {filtered.map(m => (
                  <button
                    key={m.mun_code}
                    onClick={() => {
                      setSelected(m);
                      setStatus(m.status);
                      setShowPicker(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition-colors ${
                      selected?.mun_code === m.mun_code ? 'bg-blue-50 text-[#2196F3]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold text-sm">{displayName(m.name)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === 'Critical' ? 'bg-red-100 text-red-600' :
                      m.status === 'Moderate' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>ICA {m.ica_score}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main WQI Card */}
      <motion.div
        layout
        className={`rounded-[24px] p-8 relative overflow-hidden shadow-2xl transition-all duration-700 ${
          currentStatus === 'Safe' ? 'wqi-gradient shadow-blue-500/30 text-white' :
          currentStatus === 'Moderate' ? 'wqi-gradient-moderate shadow-amber-500/30' :
          'wqi-gradient-critical shadow-red-500/30 text-white'
        }`}
      >
        <div className="text-center space-y-2">
          <h3 className="text-sm uppercase tracking-widest font-bold opacity-90">Calidad del Agua</h3>
          <div className="flex items-center justify-center mt-4">
            <span className="text-7xl font-extrabold tracking-tighter leading-tight">
              {selected?.ica_score ?? '—'}
            </span>
          </div>
          <div className="mt-2 font-bold uppercase text-[12px] tracking-wide">
            Estado: {STATUS_LABEL[currentStatus]}
          </div>
        </div>
      </motion.div>

      {/* Real indicators */}
      {selected && (
        <div className="grid grid-cols-2 gap-3">
          <IndicatorChip label="Clorofila-a" value={selected.clorof_a} unit="μg/L" />
          <IndicatorChip label="Fósforo total" value={selected.p_tot} unit="mg/L" />
          <IndicatorChip label="Nitrato NO₃" value={selected.n_no3} unit="mg/L" />
          <IndicatorChip label="Oxígeno disuelto" value={selected.od_porcentaje} unit="%" />
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-sleek-content px-1">Recomendaciones</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          {recs.map((rec, i) => (
            <motion.button
              key={rec.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActiveRec(rec)}
              className="min-w-[120px] bg-white border border-gray-100 p-5 rounded-2xl text-center space-y-2 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex-shrink-0"
            >
              <div className="text-2xl">{rec.emoji}</div>
              <p className="text-[11px] font-bold text-gray-700 leading-tight">{rec.text}</p>
              <p className="text-[10px] text-[#2196F3] font-semibold">Ver tips →</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recommendation tips modal — centered, above navbar */}
      <AnimatePresence>
        {activeRec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-5 pb-[96px]"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveRec(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl z-10 flex flex-col max-h-full overflow-hidden"
            >
              {/* Fixed header */}
              <div className="flex items-start gap-4 p-6 pb-4 flex-shrink-0">
                <span className="text-4xl">{activeRec.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-sleek-dark">{activeRec.text}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Acciones recomendadas</p>
                </div>
                <button onClick={() => setActiveRec(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              {/* Scrollable tips */}
              <ul className="overflow-y-auto px-6 pb-6 space-y-3 flex-1">
                {activeRec.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2196F3] text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IndicatorChip({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="data-chip space-y-1">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline space-x-1">
        <span className="text-lg font-bold text-[#2196F3]">{value}</span>
        <span className="text-[10px] text-gray-400 font-medium">{unit}</span>
      </div>
    </div>
  );
}
