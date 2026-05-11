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
    <div className="space-y-16 max-w-5xl mx-auto">
      <header className="flex items-end justify-between border-b border-gray-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">My Appeals</span>
          <h2 className="font-bold text-3xl md:text-4xl text-on-surface">Appeal History</h2>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="text-center py-20 opacity-40">
            <ICONS.RefreshCcw className="animate-spin mx-auto mb-4 text-violet-600" />
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Loading your appeals...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-on-surface-variant text-sm">No appeals yet. Start your first one from the Home tab.</p>
          </div>
        ) : (
          cases.map((appeal, idx) => (
            <motion.div 
              key={appeal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex flex-col md:flex-row items-start md:items-center gap-5 bg-white p-5 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border border-gray-100"
            >
              <div className="bg-violet-50 p-4 rounded-xl text-violet-400 group-hover:text-violet-600 transition-colors">
                 <ICONS.FileText size={22} strokeWidth={1.5} />
              </div>

              <div className="flex-1 space-y-1.5">
                 <div className="flex items-center gap-2.5">
                   <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">{appeal.ref}</span>
                   <span className={`text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                     appeal.status === 'Resolved'
                       ? 'bg-teal-100 text-teal-700'
                       : 'bg-violet-100 text-violet-700'
                   }`}>{appeal.status}</span>
                 </div>
                 <h3 className="font-semibold text-base text-on-surface">{appeal.title}</h3>
                 <p className="text-xs text-on-surface-variant">
                   {appeal.createdAt?.toDate ? appeal.createdAt.toDate().toLocaleDateString() : ''}
                 </p>
              </div>

              <div className="text-right space-y-1 w-full md:w-auto">
                 <p className="text-xs font-semibold text-on-surface-variant">Status</p>
                 <p className="font-medium text-on-surface whitespace-nowrap">
                   {appeal.status === 'Resolved' ? 'Resolved' : 'In Progress'}
                 </p>
                 <div className="flex justify-end gap-1.5 text-on-surface-variant group-hover:text-violet-600 transition-all">
                    <span className="text-[9px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">View details</span>
                    <ICONS.ArrowRight size={13} />
                 </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-violet-50 p-8 rounded-2xl text-center border border-violet-100 border-dashed">
         <div className="flex justify-center mb-4 text-violet-300">
           <ICONS.Shield size={36} strokeWidth={1} />
         </div>
         <h4 className="font-bold text-lg text-on-surface mb-2">Start a New Appeal</h4>
         <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            Have a new grade to dispute? Head to the Appeal tab and Regrade will walk you through it step by step.
         </p>
      </div>

    </div>
  );
}
