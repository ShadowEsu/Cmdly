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
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
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
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      {/* Hero gradient card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0d9488 100%)' }}
      >
        <div className="relative z-10">
          <h1 className="text-[28px] font-bold leading-tight mb-1">
            Hey {firstName} 👋
          </h1>
          <p className="text-lg font-medium text-white/85 mb-6">
            Let's fight for your grade.
          </p>
          <button
            onClick={onStartAppeal}
            className="bg-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all shadow-sm"
            style={{ color: '#7c3aed' }}
          >
            <ICONS.Plus size={18} strokeWidth={2.5} />
            Start New Appeal
          </button>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-4 -bottom-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      </motion.div>

      {/* Active case card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Active Appeal</span>
          {latestCase && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                latestCase.status === 'Resolved'
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-violet-100 text-violet-700'
              }`}
            >
              {latestCase.status}
            </span>
          )}
        </div>

        <h3 className="font-bold text-on-surface text-base mb-1">
          {latestCase ? latestCase.title : 'No active appeal'}
        </h3>
        <p className="text-sm text-on-surface-variant mb-4">
          {latestCase
            ? latestCase.description
            : 'Start your first appeal to get a detailed analysis of your grading.'}
        </p>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-1.5">
            <span>Appeal Progress</span>
            <span style={{ color: '#7c3aed' }}>{latestCase ? `${latestCase.progress}%` : '0%'}</span>
          </div>
          <div className="w-full h-2 bg-violet-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${latestCase?.progress ?? 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #0d9488)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* AI Advocate card */}
      <motion.button
        type="button"
        onClick={onOpenChat}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full text-left bg-teal-100 rounded-2xl p-5 border border-teal-200 hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
              <ICONS.MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-teal-900 text-sm">Ask your AI advocate</p>
              <p className="text-xs text-teal-700 mt-0.5">Get advice on rubrics, feedback, and appeals</p>
            </div>
          </div>
          <ICONS.ArrowRight size={18} className="text-teal-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.button>

      {/* Quick tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-violet-50 rounded-2xl p-4 flex items-start gap-3"
      >
        <ICONS.Zap size={18} className="text-violet-500 shrink-0 mt-0.5" />
        <p className="text-sm text-violet-800 font-medium leading-snug">
          You've got this. Most grade appeals succeed when you reference specific rubric criteria — Regrade helps you find them.
        </p>
      </motion.div>
    </div>
  );
}
