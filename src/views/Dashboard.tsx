import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';
import { auth } from '../lib/firebase';
import { caseService, Case } from '../services/caseService';

export default function Dashboard({
  onStartAppeal,
  onOpenChat,
}: {
  onStartAppeal: () => void;
  onOpenChat: () => void;
}) {
  const user = auth.currentUser;
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Member';
  const [latestCase, setLatestCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const cases = await caseService.getUserCases();
        if (cases.length > 0) {
          setLatestCase(cases[0]);
        }
      } catch (err) {
        console.error("Failed to load appeal records:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-20 md:space-y-32 max-w-7xl mx-auto py-6 sm:py-8 md:py-12">
      <section className="relative text-left">
        <div className="max-w-4xl mb-8 sm:mb-12 md:mb-20 space-y-6 sm:space-y-8 md:space-y-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-px bg-primary/20 w-8 sm:w-12" />
            <span className="text-[10px] sm:text-[12px] md:text-sm font-light tracking-[0.45em] text-primary opacity-45 uppercase">
              Your Dashboard
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-primary font-light leading-[1.08] tracking-tight -ml-1"
          >
            Welcome, <span className="font-light italic text-primary/60">{firstName}</span>.
          </motion.h1>

          <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 md:gap-8 text-on-surface-variant font-medium text-base sm:text-xl md:text-2xl opacity-80">
            <div className="flex items-center gap-2 sm:gap-4 bg-green-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-500/20 flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-light uppercase tracking-widest text-green-700">Signed In</span>
            </div>
            <p className="leading-relaxed font-serif max-w-xl text-primary/70">
              Ready to help you build a clear, professional grade appeal.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartAppeal}
          className="w-full bg-primary text-white p-5 sm:p-8 md:p-10 lg:p-14 rounded-2xl sm:rounded-3xl lg:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 md:gap-8 lg:gap-10 group relative overflow-hidden transition-all border border-white/10 min-h-32 sm:min-h-48 md:min-h-56"
        >
          <div className="absolute inset-0 paper-texture opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />

          <div className="flex items-start lg:items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 relative z-10 text-left w-full">
            <div className="p-3 sm:p-4 md:p-6 bg-white/10 rounded-2xl sm:rounded-3xl border border-white/20 backdrop-blur-xl shadow-xl group-hover:scale-110 transition-transform flex-shrink-0">
              <ICONS.Plus size={32} strokeWidth={2} className="text-white sm:w-8 sm:h-8 md:w-12 md:h-12" />
            </div>
            <div className="space-y-1 sm:space-y-2 md:space-y-3 flex-grow min-w-0">
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-light tracking-tight leading-tight break-words">Start New Appeal</h2>
              <p className="text-white/60 font-serif italic text-xs sm:text-base md:text-lg lg:text-xl max-w-lg leading-relaxed hidden sm:block">Upload your graded assignment and let Regrade analyze your case.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative z-10 bg-white text-primary px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 rounded-lg sm:rounded-full group-hover:bg-white/90 transition-all shadow-xl hover:scale-105 flex-shrink-0 min-h-10 sm:min-h-12">
            <span className="font-light uppercase tracking-[0.28em] text-xs hidden sm:inline">Get started</span>
            <span className="font-light uppercase tracking-[0.28em] text-xs sm:hidden">Go</span>
            <ICONS.ArrowRight className="group-hover:translate-x-1 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </motion.button>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
        <motion.div className="glass-panel rounded-2xl sm:rounded-3xl lg:rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-full border border-primary/10 bg-white shadow-xl">
          <div className="md:w-2/5 h-40 sm:h-48 md:h-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
              <ICONS.FileText size={64} className="text-primary/10 sm:w-20 sm:h-20 md:w-24 md:h-24" />
            </div>
          </div>
          <div className="md:w-3/5 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-between space-y-4 sm:space-y-6 md:space-y-8">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 sm:gap-3">
                <span className="text-[10px] sm:text-[11px] font-light uppercase tracking-[0.22em] text-[#006c49] bg-green-500/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-green-500/20 w-fit">
                  {latestCase ? latestCase.status : 'No appeals yet'}
                </span>
                {latestCase && (
                  <span className="font-mono text-[10px] sm:text-[11px] text-primary/40 uppercase tracking-widest">{latestCase.ref}</span>
                )}
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary font-light leading-tight tracking-tight break-words">
                {latestCase ? latestCase.title : 'No active appeal'}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-primary/60 font-serif italic leading-relaxed">
                {latestCase ? latestCase.description : 'Start your first appeal to get a detailed analysis of your grading.'}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 md:space-y-6 pt-4 sm:pt-6 md:pt-8 border-t border-primary/5">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-light uppercase tracking-[0.28em] text-primary/50">
                <span>Appeal Progress</span>
                <span className="text-primary">{latestCase ? `${latestCase.progress}% Complete` : '0%'}</span>
              </div>
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                {['Evidence', 'Analyzed', 'Submitted'].map((label, idx) => {
                  const isActive = latestCase && (
                    (idx === 0 && latestCase.evidenceLogged) ||
                    (idx === 1 && latestCase.progress >= 50) ||
                    (idx === 2 && latestCase.status === 'Resolved')
                  );
                  return (
                    <div key={label} className="flex-1 space-y-1.5 sm:space-y-2">
                      <div className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-primary shadow-sm w-full' : 'bg-primary/10 w-1/2'}`} />
                      <p
                        className={`text-[9px] sm:text-[10px] font-light uppercase tracking-widest leading-tight ${isActive ? 'text-primary' : 'text-primary/30'}`}
                      >
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <section className="pb-6 sm:pb-12 md:pb-20 max-w-2xl">
        <button
          type="button"
          onClick={onOpenChat}
          className="text-left w-full group glass-panel p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl hover:bg-primary/[0.06] active:scale-[0.98] transition-all border-2 border-primary/15 ring-1 ring-primary/5 min-h-12 sm:min-h-14 md:min-h-16"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 text-primary group-hover:text-primary transition-colors gap-2">
            <span className="flex items-center gap-2 flex-shrink-0">
              <ICONS.MessageSquare size={20} strokeWidth={1.75} className="sm:w-6 sm:h-6" />
              <span className="text-[8px] sm:text-[10px] font-light uppercase tracking-[0.35em] text-secondary">Live</span>
            </span>
            <ICONS.ArrowRight size={16} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 sm:w-5 sm:h-5" />
          </div>
          <h4 className="font-serif text-lg sm:text-2xl md:text-[1.65rem] text-primary font-light mb-1 sm:mb-2 break-words">Appeal assistant chat</h4>
          <p className="text-xs sm:text-[13px] md:text-sm text-on-surface-variant/70 font-light leading-relaxed tracking-tight">
            Ask how to read feedback, frame an appeal, or what to send your instructor. Same assistant as the{' '}
            <span className="text-primary/80">Chat</span> tab — open anytime.
          </p>
        </button>
      </section>
    </div>
  );
}
