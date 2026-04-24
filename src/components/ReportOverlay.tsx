/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Phone, X, ShieldCheck, AlertTriangle, FileText, ChevronLeft, Upload } from 'lucide-react';
import { UserReport } from '../types.ts';

interface ReportOverlayProps {
  onClose: () => void;
  onAddReport: (report: UserReport) => void;
}

type Screen = 'menu' | 'form';

export function ReportOverlay({ onClose, onAddReport }: ReportOverlayProps) {
  const [screen, setScreen] = useState<Screen>('menu');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({ descripcion: '', tipo: 'quimica', nivel: 'moderado', direccion: '' });
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleEmergency = () => {
    window.location.href = 'tel:8009000800';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const report: UserReport = {
      id: Date.now().toString(),
      descripcion: form.descripcion,
      tipo: form.tipo,
      nivel: form.nivel,
      direccion: form.direccion,
      photoName: photoFile?.name,
      photoUrl: photoFile ? URL.createObjectURL(photoFile) : undefined,
      status: 'Under Review',
      createdAt: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    onAddReport(report);
    setSubmitted(true);
    setTimeout(onClose, 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md" onClick={onClose} />

      {/* Modal — white background for form, glass for menu */}
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        className={`w-full max-w-md rounded-[40px] p-8 relative z-10 shadow-2xl overflow-hidden transition-colors duration-300 ${
          screen === 'form' && !submitted
            ? 'bg-white border border-gray-200'
            : 'glass border border-white/40'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            screen === 'form' && !submitted
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {/* Menu screen */}
          {screen === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">Reportar Estado</h2>
                <p className="text-blue-100 font-medium opacity-80">Selecciona cómo deseas reportar.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setScreen('form')}
                  className="flex items-center space-x-5 p-7 bg-white rounded-[28px] shadow-xl group transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-[#2196F3] group-hover:bg-[#2196F3] group-hover:text-white transition-colors">
                    <FileText size={28} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-800">Enviar Reporte</h3>
                    <p className="text-sm text-gray-500 font-medium">Formulario ambiental con foto</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmergency}
                  className="flex items-center space-x-5 p-7 bg-red-500 rounded-[28px] shadow-xl shadow-red-900/20 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                    <Phone size={28} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">Llamada de Emergencia</h3>
                    <p className="text-sm text-red-100 font-medium opacity-80">CONAGUA: 800 900 0800</p>
                  </div>
                </motion.button>
              </div>

              <div className="flex items-center justify-center space-x-6 pt-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-blue-100">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Seguro</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-blue-100">
                    <AlertTriangle size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Confidencial</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form screen — white background, dark text */}
          {screen === 'form' && !submitted && (
            <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div className="flex items-center gap-3 pr-10">
                <button
                  onClick={() => setScreen('menu')}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                >
                  <ChevronLeft size={18} />
                </button>
                <h2 className="text-2xl font-black text-sleek-dark">Nuevo Reporte</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción del problema *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Describe lo que observaste..."
                    className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-2xl px-4 py-3 text-sm font-medium outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</label>
                    <select
                      value={form.tipo}
                      onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                      className="w-full bg-gray-50 text-gray-800 rounded-2xl px-3 py-3 text-sm font-medium outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="quimica">Química</option>
                      <option value="biologica">Biológica</option>
                      <option value="fisica">Física</option>
                      <option value="emergencia">Emergencia</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nivel</label>
                    <select
                      value={form.nivel}
                      onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                      className="w-full bg-gray-50 text-gray-800 rounded-2xl px-3 py-3 text-sm font-medium outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="bajo">Bajo</option>
                      <option value="moderado">Moderado</option>
                      <option value="alto">Alto</option>
                      <option value="critico">Crítico</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dirección / Ubicación</label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                    placeholder="Ej. Calle Reforma #23, Zapopan"
                    className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-2xl px-4 py-3 text-sm font-medium outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fotografía (opcional)</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={e => setPhotoFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full bg-gray-50 border border-gray-200 border-dashed rounded-2xl px-4 py-4 flex items-center justify-center gap-3 text-gray-500 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <Camera size={18} className="text-gray-400" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {photoFile ? photoFile.name : 'Agregar fotografía'}
                    </span>
                    {photoFile && <Upload size={14} className="text-green-500 flex-shrink-0" />}
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full bg-[#2196F3] text-white font-black rounded-2xl py-4 text-sm tracking-wider uppercase shadow-lg hover:bg-blue-600 transition-colors"
                >
                  Enviar Reporte
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Success */}
          {submitted && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-4"
            >
              <div className="text-6xl">✅</div>
              <h3 className="text-2xl font-black text-white">¡Reporte enviado!</h3>
              <p className="text-blue-100 font-medium opacity-80">
                Gracias por contribuir a la calidad del agua en Jalisco.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
