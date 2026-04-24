/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shield, ChevronRight, LogOut, ShieldAlert, X, Check } from 'lucide-react';
import { UserReport } from '../types.ts';

interface ProfileViewProps {
  reports: UserReport[];
  onEnterAdmin: () => void;
}

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

const TIPO_LABEL: Record<string, string> = {
  quimica: 'Química',
  biologica: 'Biológica',
  fisica: 'Física',
  emergencia: 'Emergencia',
};

export function ProfileView({ reports, onEnterAdmin }: ProfileViewProps) {
  const [userName, setUserName] = useState('Vanesa de la Torre');
  const [showSettings, setShowSettings] = useState(false);
  const [draftName, setDraftName] = useState(userName);

  const resolved = reports.filter(r => r.status === 'Resolved').length;

  const saveSettings = () => {
    if (draftName.trim()) setUserName(draftName.trim());
    setShowSettings(false);
  };

  return (
    <div className="px-6 pt-12 pb-8 space-y-8 text-sleek-dark">
      {/* Profile Info */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-[38px] bg-white p-1 shadow-2xl">
            <div className="w-full h-full rounded-[34px] bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white overflow-hidden">
              <img
                src="https://picsum.photos/seed/user/200/200"
                alt="User Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg text-blue-500">
            <Shield size={20} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-tight text-sleek-dark">{userName}</h3>
          <p className="text-gray-500 font-medium italic">Ciudadana Eco Oro · Guadalajara</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#E3F2FD] p-5 rounded-3xl text-center flex flex-col items-center space-y-1 shadow-sm">
          <span className="text-2xl font-black text-blue-600">{reports.length}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Reportes Realizados</span>
        </div>
        <div className="bg-white border border-[#E3F2FD] p-5 rounded-3xl text-center flex flex-col items-center space-y-1 shadow-sm">
          <span className="text-2xl font-black text-green-600">{resolved}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Casos Resueltos</span>
        </div>
      </div>

      {/* My Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold">Mis Reportes</h3>
          <span className="text-xs font-bold text-gray-400">{reports.length} total</span>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white border border-[#E3F2FD] rounded-[20px] p-8 text-center shadow-sm">
            <p className="text-gray-400 font-medium text-sm">Aún no has enviado reportes.</p>
            <p className="text-gray-300 text-xs mt-1">Usa el botón + para reportar un problema.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="bg-white border border-[#E3F2FD] p-5 rounded-[20px] shadow-sm flex flex-col space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-[13px] font-bold text-sleek-dark leading-snug flex-1 line-clamp-2">
                    {report.descripcion}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0 ${STATUS_STYLE[report.status]}`}>
                    {STATUS_LABEL[report.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {TIPO_LABEL[report.tipo] ?? report.tipo}
                  </span>
                  <span className="text-gray-200">·</span>
                  <span className="text-[10px] font-medium text-gray-400">{report.createdAt}</span>
                  {report.direccion && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="text-[10px] font-medium text-gray-400 truncate max-w-[120px]">{report.direccion}</span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Menu Options */}
      <div className="bg-white/40 backdrop-blur-md rounded-[32px] overflow-hidden border border-white/20">
        <MenuOption
          icon={<Settings size={20} />}
          label="Configuración de perfil"
          onClick={() => { setDraftName(userName); setShowSettings(true); }}
        />
        <MenuOption
          icon={<ShieldAlert size={20} />}
          label="Acceder como Admin"
          color="text-purple-600"
          onClick={onEnterAdmin}
        />
        <MenuOption icon={<LogOut size={20} />} label="Cerrar Sesión" color="text-red-500" />
      </div>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-5 pb-[96px]"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl z-10 p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-sleek-dark">Configuración de perfil</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Avatar preview */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-white shadow-md p-0.5 flex-shrink-0">
                  <img
                    src="https://picsum.photos/seed/user/200/200"
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-[18px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-sleek-dark truncate">{draftName || 'Sin nombre'}</p>
                  <p className="text-xs text-gray-400 font-medium">Ciudadana Eco Oro · Guadalajara</p>
                </div>
              </div>

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre completo</label>
                <input
                  autoFocus
                  type="text"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveSettings()}
                  placeholder="Tu nombre"
                  className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-2xl px-4 py-3 text-sm font-medium outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold rounded-2xl py-3 text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveSettings}
                  className="flex-1 bg-[#2196F3] text-white font-bold rounded-2xl py-3 text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  <Check size={16} />
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuOption({
  icon,
  label,
  color = 'text-gray-700',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 hover:bg-white/40 transition-colors border-b border-white/10 last:border-0 text-left"
    >
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className={`font-bold ${color}`}>{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-300" />
    </button>
  );
}
