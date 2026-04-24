/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home as HomeIcon, Map as MapIcon, PlusCircle, Info, User } from 'lucide-react';
import { WaterStatus, UserReport } from './types.ts';

// Components
import { HomeView } from './components/HomeView.tsx';
import { MapView } from './components/MapView.tsx';
import { EducationView } from './components/EducationView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { ReportOverlay } from './components/ReportOverlay.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'report' | 'info' | 'profile'>('home');
  const [waterStatus, setWaterStatus] = useState<WaterStatus>('Safe');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<UserReport[]>([]);

  const addReport = (r: UserReport) => setReports(prev => [r, ...prev]);

  const updateReportStatus = (id: string, status: UserReport['status']) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const bgStyles = useMemo(() => {
    switch (waterStatus) {
      case 'Critical':
        return 'bg-linear-to-br from-[#FFF5F5] to-[#FFE4E4]';
      case 'Moderate':
        return 'bg-linear-to-br from-[#FFFEF0] to-[#FFF9C4]';
      default:
        return 'sleek-gradient-bg';
    }
  }, [waterStatus]);

  if (isAdmin) {
    return (
      <div className="min-h-screen sleek-gradient-bg flex flex-col relative overflow-hidden text-sleek-dark">
        <AdminView
          reports={reports}
          onUpdateStatus={updateReportStatus}
          onExit={() => setIsAdmin(false)}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView setStatus={setWaterStatus} currentStatus={waterStatus} />;
      case 'map':
        return <MapView />;
      case 'info':
        return <EducationView />;
      case 'profile':
        return (
          <ProfileView
            reports={reports}
            onEnterAdmin={() => setIsAdmin(true)}
          />
        );
      default:
        return <HomeView setStatus={setWaterStatus} currentStatus={waterStatus} />;
    }
  };

  return (
    <div className={`min-h-screen ${bgStyles} transition-colors duration-700 flex flex-col relative overflow-hidden text-sleek-dark`}>
      <main className={`flex-1 z-10 scrollbar-hide overflow-y-auto ${activeTab !== 'map' ? 'pb-28' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-[80px] bg-white/90 backdrop-blur-md z-50 flex items-center justify-around px-4 border-t border-gray-100 shadow-2xl">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<HomeIcon size={24} />} label="Inicio" />
        <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={24} />} label="Mapa" />

        <button
          onClick={() => setIsReportOpen(true)}
          className="relative -top-10 w-16 h-16 bg-[#2196F3] text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 border-4 border-white hover:scale-110 active:scale-95 transition-all"
        >
          <PlusCircle size={32} />
        </button>

        <NavButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={<Info size={24} />} label="Educa" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={24} />} label="Perfil" />
      </nav>

      <AnimatePresence>
        {isReportOpen && (
          <ReportOverlay onClose={() => setIsReportOpen(false)} onAddReport={addReport} />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${active ? 'text-[#2196F3] scale-110' : 'text-gray-400 opacity-70 hover:opacity-100'}`}
    >
      {icon}
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </button>
  );
}
