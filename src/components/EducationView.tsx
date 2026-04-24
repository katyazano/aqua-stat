/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, ExternalLink } from 'lucide-react';

interface Card {
  id: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  url: string;
}

const CARDS: Card[] = [
  {
    id: 'ica',
    category: 'Índice de calidad',
    title: 'Índice de Calidad del Agua (ICA)',
    description:
      'El ICA integra múltiples parámetros en un valor de 0 a 100. Valores ≥70 = Bueno, 50–69 = Regular, <50 = Malo. Es la métrica principal usada por CONAGUA para clasificar cuerpos de agua superficial en México.',
    emoji: '📊',
    url: 'https://www.gob.mx/conagua',
  },
  {
    id: 'clorofila',
    category: 'Indicador biológico',
    title: 'Clorofila-a',
    description:
      'La clorofila-a es el pigmento principal de algas y cianobacterias. Concentraciones altas (>20 μg/L) indican floraciones algales que reducen el oxígeno disuelto y pueden generar toxinas nocivas para humanos y animales.',
    emoji: '🌿',
    url: 'https://es.wikipedia.org/wiki/Clorofila',
  },
  {
    id: 'fosforo',
    category: 'Nutriente',
    title: 'Fósforo Total',
    description:
      'El fósforo total incluye todas las formas de fósforo en el agua. Niveles >0.1 mg/L provocan eutrofización: crecimiento masivo de algas, agotamiento del oxígeno y muerte de peces. Su principal fuente son fertilizantes y aguas residuales.',
    emoji: '🧪',
    url: 'https://es.wikipedia.org/wiki/Eutrofizaci%C3%B3n',
  },
  {
    id: 'nitrato',
    category: 'Contaminante',
    title: 'Nitrato (NO₃)',
    description:
      'Los nitratos son indicadores de contaminación agrícola o de aguas residuales. En bebés menores de 6 meses pueden causar metahemoglobinemia. La OMS establece un límite de 50 mg/L para agua potable.',
    emoji: '⚗️',
    url: 'https://es.wikipedia.org/wiki/Nitrato',
  },
  {
    id: 'oxigeno',
    category: 'Parámetro físico-químico',
    title: 'Oxígeno Disuelto',
    description:
      'El oxígeno disuelto (OD) es esencial para la vida acuática. Valores <60% de saturación son hipóxicos y ponen en riesgo la fauna acuática. La contaminación orgánica, temperatura elevada y exceso de nutrientes reducen el OD.',
    emoji: '💨',
    url: 'https://es.wikipedia.org/wiki/Ox%C3%ADgeno_disuelto',
  },
  {
    id: 'pipas',
    category: 'Acceso al agua',
    title: 'Distribución por Pipas',
    description:
      'El porcentaje de hogares que reciben agua por pipa indica ausencia de red pública confiable. Alta dependencia eleva el costo y el riesgo sanitario: el agua transportada puede contaminarse o no cumplir los mismos estándares que la de red.',
    emoji: '🚛',
    url: 'https://www.gob.mx/conagua',
  },
];

const FACT = {
  text: 'México es el segundo país con mayor consumo de agua embotellada per cápita en el mundo, con más de 234 litros por persona al año — en gran parte por la desconfianza en la calidad del agua de grifo.',
  url: 'https://es.wikipedia.org/wiki/Agua_embotellada',
};

export function EducationView() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      CARDS.filter(
        c =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div className="px-6 pt-12 pb-8 space-y-6 text-sleek-dark">
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight">Aprende</h2>
        <p className="text-gray-500 font-medium">Parámetros que definen la calidad del agua.</p>
      </div>

      {/* Search */}
      <div className="glass px-5 py-3 rounded-3xl flex items-center space-x-3">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar temas..."
          className="bg-transparent border-none outline-none flex-1 font-medium placeholder:text-gray-400 text-sm"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 font-medium py-8">Sin resultados para "{query}"</p>
        )}
        {filtered.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="bg-white border border-[#E3F2FD] p-6 rounded-[20px] shadow-sm hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#2196F3] font-bold uppercase tracking-wider">{item.category}</span>
                <span className="text-xl">{item.emoji}</span>
              </div>
              <h4 className="text-xl font-black text-sleek-dark">{item.title}</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{item.description}</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2196F3] hover:text-blue-700 transition-colors"
              >
                Leer más <ExternalLink size={11} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sabías que */}
      <div className="bg-linear-to-br from-[#1A237E] to-[#2196F3] p-8 rounded-[40px] text-white space-y-4 shadow-xl shadow-blue-900/20">
        <h5 className="font-bold uppercase tracking-widest text-[10px] opacity-60">¿Sabías que?</h5>
        <p className="text-lg font-medium leading-relaxed">{FACT.text}</p>
        <a
          href={FACT.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2196F3] rounded-2xl font-bold text-sm shadow-lg hover:bg-blue-50 transition-colors"
        >
          Leer artículo completo <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
