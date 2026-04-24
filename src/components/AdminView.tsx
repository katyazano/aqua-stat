/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldAlert, ChevronDown } from 'lucide-react';
import { UserReport } from '../types.ts';

interface AdminViewProps {
  reports: UserReport[];
  onUpdateStatus: (id: string, status: UserReport['status']) => void;
  onExit: () => void;
}

type Filter = 'all' | UserReport['status'];

const STATUS_LABEL: Record<UserReport['status'], string> = {
  'Under Review': 'En Revisión',
  'In Progress': 'En Curso',
  'Resolved': 'Resuelto',
};

const STATUS_STYLE: Record<UserReport['status'], string> = {
  'Under Review': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Resolved': 'bg-green-100 text-green-700',
};

const NIVEL_STYLE: Record<string, string> = {
  bajo: 'bg-gray-100 text-gray-600',
  moderado: 'bg-amber-100 text-amber-700',
  alto: 'bg-orange-100 text-orange-700',
  critico: 'bg-red-100 text-red-700',
};

const TIPO_LABEL: Record<string, string> = {
  quimica: 'Química',
  biologica: 'Biológica',
  fisica: 'Física',
  emergencia: 'Emergencia',
};

const NEXT_STATUS: Record<UserReport['status'], UserReport['status']> = {
  'Under Review': 'In Progress',
  'In Progress': 'Resolved',
  'Resolved': 'Under Review',
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'Under Review', label: 'En Revisión' },
  { key: 'In Progress', label: 'En Curso' },
  { key: 'Resolved', label: 'Resueltos' },
];

export function AdminView({ reports, onUpdateStatus, onExit }: AdminViewProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const counts: Record<Filter, number> = {
    all: reports.length,
    'Under Review': reports.filter(r => r.status === 'Under Review').length,
    'In Progress': reports.filter(r => r.status === 'In Progress').length,
    'Resolved': reports.filter(r => r.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <ArrowLeft size={20} className="text-sleek-dark" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert size={22} className="text-purple-600" />
            <h2 className="text-2xl font-black text-sleek-dark tracking-tight">Panel Admin</h2>
          </div>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <SummaryChip label="En Revisión" count={counts['Under Review']} color="text-blue-600" bg="bg-blue-50" />
          <SummaryChip label="En Curso" count={counts['In Progress']} color="text-amber-600" bg="bg-amber-50" />
          <SummaryChip label="Resueltos" count={counts['Resolved']} color="text-green-600" bg="bg-green-50" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f.key
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                  : 'bg-white/80 text-gray-500 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`ml-1.5 text-[10px] font-black ${filter === f.key ? 'opacity-70' : 'text-gray-400'}`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Report list */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white/60 rounded-[20px] p-10 text-center mt-4">
            <p className="text-gray-400 font-medium">No hay reportes en esta categoría.</p>
          </div>
        ) : (
          filtered.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden"
            >
              {/* Main row */}
              <button
                className="w-full text-left p-5 flex items-start gap-3"
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                {/* Photo thumbnail */}
                {report.photoUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                    <img src={report.photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-[13px] font-bold text-sleek-dark leading-snug line-clamp-2">
                    {report.descripcion}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${STATUS_STYLE[report.status]}`}>
                      {STATUS_LABEL[report.status]}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${NIVEL_STYLE[report.nivel] ?? 'bg-gray-100 text-gray-600'}`}>
                      {report.nivel.charAt(0).toUpperCase() + report.nivel.slice(1)}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">{report.createdAt}</span>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${expandedId === report.id ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Expanded details + status controls */}
              <AnimatePresence initial={false}>
                {expandedId === report.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <InfoField label="Tipo" value={TIPO_LABEL[report.tipo] ?? report.tipo} />
                        <InfoField label="Nivel" value={report.nivel.charAt(0).toUpperCase() + report.nivel.slice(1)} />
                        {report.direccion && <InfoField label="Dirección" value={report.direccion} span />}
                        {report.photoName && <InfoField label="Archivo adjunto" value={report.photoName} span />}
                      </div>

                      {/* Status selector */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cambiar estado</p>
                        <div className="flex gap-2 flex-wrap">
                          {(Object.keys(STATUS_LABEL) as UserReport['status'][]).map(s => (
                            <button
                              key={s}
                              onClick={() => onUpdateStatus(report.id, s)}
                              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                                report.status === s
                                  ? `${STATUS_STYLE[s]} border-transparent shadow-sm scale-105`
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {STATUS_LABEL[s]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick advance button */}
                      {report.status !== 'Resolved' && (
                        <button
                          onClick={() => onUpdateStatus(report.id, NEXT_STATUS[report.status])}
                          className="w-full bg-purple-600 text-white font-bold rounded-2xl py-3 text-xs uppercase tracking-wider hover:bg-purple-700 transition-colors"
                        >
                          Avanzar → {STATUS_LABEL[NEXT_STATUS[report.status]]}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryChip({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-3 text-center`}>
      <p className={`text-xl font-black ${color}`}>{count}</p>
      <p className={`text-[9px] font-bold uppercase tracking-wider ${color} opacity-70 leading-tight mt-0.5`}>{label}</p>
    </div>
  );
}

function InfoField({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-700 leading-snug">{value}</p>
    </div>
  );
}
