import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';
import { caseService, Case } from '../services/caseService';

export default function History() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await caseService.getUserCases();
        setCases(data);
      } catch (err) {
        console.error("Failed to load appeal history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16 max-w-5xl mx-auto">
      <header className="flex items-end justify-between border-b border-primary/5 pb-4 sm:pb-6 md:pb-8">
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30 block mb-1 sm:mb-2">My Appeals</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary font-light break-words">Appeal History</h2>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
        {loading ? (
          <div className="text-center py-12 sm:py-16 md:py-20 opacity-20">
            <ICONS.RefreshCcw className="animate-spin mx-auto mb-3 sm:mb-4 w-6 h-6 sm:w-8 sm:h-8" />
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Loading your appeals...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20 glass-panel rounded-xl sm:rounded-2xl md:rounded-3xl border-dashed border-2 border-primary/5">
            <p className="text-on-surface-variant font-serif italic opacity-40 text-sm sm:text-base md:text-lg px-4">No appeals yet. Start your first one from the Home tab.</p>
          </div>
        ) : (
          cases.map((appeal, idx) => (
            <motion.div
              key={appeal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 glass-panel p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-[2rem] hover:bg-white active:scale-[0.98] transition-all cursor-pointer border border-primary/5 min-h-20"
            >
              <div className="bg-primary/5 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl text-primary/40 group-hover:text-primary transition-colors flex-shrink-0">
                 <ICONS.FileText size={24} strokeWidth={1} className="sm:w-7 sm:h-7 md:w-7 md:h-7" />
              </div>

              <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                 <div className="flex items-center gap-2 flex-wrap">
                   <span className="text-[9px] sm:text-[10px] font-mono opacity-40 uppercase tracking-tighter">{appeal.ref}</span>
                   <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                     appeal.status === 'Resolved' ? 'bg-secondary/10 text-secondary' : 'bg-primary/5 text-primary/60'
                   }`}>{appeal.status}</span>
                 </div>
                 <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-primary font-medium tracking-tight translate-y-[-2px] break-words">{appeal.title}</h3>
                 <p className="text-[9px] sm:text-xs text-on-surface-variant font-serif italic opacity-40">
                   {appeal.createdAt?.toDate ? appeal.createdAt.toDate().toLocaleDateString() : ''}
                 </p>
              </div>

              <div className="text-right space-y-1 sm:space-y-2 w-full md:w-auto flex-shrink-0 sm:ml-auto">
                 <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary/30">Status</p>
                 <p className="font-serif text-base sm:text-lg md:text-xl text-primary italic font-light whitespace-nowrap">
                   {appeal.status === 'Resolved' ? 'Resolved' : 'In Progress'}
                 </p>
                 <div className="flex justify-end gap-1 sm:gap-2 text-primary/40 group-hover:text-primary transition-all">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">View details</span>
                    <ICONS.ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
                 </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="glass-panel p-6 sm:p-8 md:p-12 rounded-lg sm:rounded-2xl md:rounded-[3rem] text-center bg-primary/5 border border-primary/5 border-dashed">
         <div className="flex justify-center mb-3 sm:mb-4 md:mb-6 text-primary/20">
           <ICONS.Shield size={40} strokeWidth={0.5} className="sm:w-12 sm:h-12 md:w-12 md:h-12" />
         </div>
         <h4 className="font-serif text-lg sm:text-xl md:text-2xl text-primary font-light mb-2 sm:mb-3 md:mb-4">Start a New Appeal</h4>
         <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto font-serif italic mb-4 sm:mb-6 md:mb-8 opacity-60 px-2">
            Have a new grade to dispute? Head to the Appeal tab and Regrade will walk you through it step by step.
         </p>
      </div>

    </div>
  );
}
