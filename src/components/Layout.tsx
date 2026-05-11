import React from 'react';
import { motion } from 'motion/react';
import { ICONS, DEFAULT_AVATAR_SRC } from '../constants';
import { auth } from '../lib/firebase';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const user = auth.currentUser;
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || '';

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: ICONS.Home },
    { id: 'upload', label: 'Appeal', icon: ICONS.Upload },
    { id: 'chat', label: 'Chat', icon: ICONS.MessageSquare },
    { id: 'history', label: 'History', icon: ICONS.History },
    { id: 'profile', label: 'Profile', icon: ICONS.User },
  ];

  return (
    <div className="min-h-screen flex flex-col relative bg-surface selection:bg-primary/10">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-14 md:min-h-16 py-2 md:py-0 flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => onTabChange('dashboard')}
          >
            <span className="text-xl font-extrabold tracking-tight" style={{ color: '#7c3aed' }}>regrade</span>
          </div>

          <div className="flex items-center gap-10">
            <nav className="hidden lg:flex items-center gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`font-semibold text-sm transition-all relative py-2 ${
                    activeTab === tab.id ? '' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  style={activeTab === tab.id ? { color: '#7c3aed' } : undefined}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: '#7c3aed' }}
                    />
                  )}
                </button>
              ))}
            </nav>

            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onTabChange('profile')}
            >
              {firstName && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-on-surface-variant leading-none mb-0.5">
                    Signed in as
                  </p>
                  <p className="text-sm font-bold text-on-surface">{firstName}</p>
                </div>
              )}
              <div className="w-10 h-10 rounded-xl border-2 p-0.5 overflow-hidden bg-white shadow-sm transition-all group-hover:shadow-md" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
                <img
                  src={user?.photoURL || DEFAULT_AVATAR_SRC}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pb-28 md:pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10"
        >
          {children}
        </motion.div>
      </main>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-2 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))]"
        aria-label="Main"
      >
        <div className="flex justify-around items-stretch max-w-lg mx-auto gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center gap-1 transition-all flex-1 min-h-[3.25rem] min-w-0 py-2 px-1 rounded-xl active:scale-[0.98]"
                style={{ color: isActive ? '#7c3aed' : '#9ca3af' }}
              >
                <tab.icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold leading-tight text-center">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
