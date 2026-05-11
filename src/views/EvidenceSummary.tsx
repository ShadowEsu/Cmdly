import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';
import { caseService, Case } from '../services/caseService';

export default function EvidenceSummary({ caseId, onFinalize }: { caseId: string | null, onFinalize: () => void }) {
  const [tone, setTone] = useState(50);
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);

  useEffect(() => {
    if (caseId) {
      caseService.getCaseById(caseId).then(data => {
        if (data) setCurrentCase(data);
      });
    }
  }, [caseId]);

  return (
    <div className="space-y-24 max-w-7xl mx-auto">
      {/* Evidence Bento Section */}
      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="flex-1 h-px bg-gray-100" />
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Analysis Summary</span>
            <h2 className="font-bold text-4xl md:text-5xl text-on-surface tracking-tight">Your Case</h2>
          </div>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {currentCase?.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">From your materials</p>
                <h3 className="font-bold text-2xl md:text-3xl text-on-surface tracking-tight">
                  {currentCase.analysis.assignment.title || currentCase.title || 'Your submission'}
                </h3>
                {currentCase.analysis.assignment.subject && (
                  <p className="text-sm text-on-surface-variant mt-1">{currentCase.analysis.assignment.subject}</p>
                )}
              </div>
              <div className="text-left md:text-right space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Score (as read by AI)</p>
                <p className="font-bold text-2xl text-on-surface">
                  {currentCase.analysis.assignment.total_score_display ||
                    (currentCase.analysis.assignment.total_score_earned != null &&
                    currentCase.analysis.assignment.total_score_possible != null
                      ? `${currentCase.analysis.assignment.total_score_earned} / ${currentCase.analysis.assignment.total_score_possible}`
                      : 'See question breakdown')}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Case strength:{' '}
                  <span className="font-bold uppercase tracking-wide" style={{ color: '#7c3aed' }}>
                    {currentCase.analysis.case_analysis.overall_case_strength}
                  </span>
                  {typeof currentCase.analysis.confidence?.overall_confidence === 'number' && (
                    <span className="text-on-surface-variant">
                      {' '}
                      · Confidence {Math.round(currentCase.analysis.confidence.overall_confidence * 100)}%
                    </span>
                  )}
                </p>
              </div>
            </div>

            {currentCase.analysis.case_analysis?.case_strength_reason && (
              <p className="text-sm text-on-surface-variant leading-relaxed border-l-4 pl-4" style={{ borderColor: 'rgba(13,148,136,0.4)' }}>
                {currentCase.analysis.case_analysis.case_strength_reason}
              </p>
            )}

            {currentCase.analysis.questions?.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-violet-50 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3">Question</th>
                      <th className="px-4 py-3">Points</th>
                      <th className="px-4 py-3 hidden sm:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-on-surface/80">
                    {currentCase.analysis.questions.slice(0, 12).map((q) => (
                      <tr key={q.question_id}>
                        <td className="px-4 py-3 font-medium">{q.question_id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {q.points_earned != null && q.points_possible != null
                            ? `${q.points_earned} / ${q.points_possible}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant hidden sm:table-cell max-w-md truncate">
                          {q.question_description || (q.deductions_with_no_comment ? 'Deductions without clear comment' : '')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            {
              icon: ICONS.Check,
              title: 'Rubric Alignment',
              val: 'KEY FINDING',
              desc: currentCase?.analysis?.case_analysis?.strongest_appeal_points?.[0]
                ? String(currentCase.analysis.case_analysis.strongest_appeal_points[0])
                : 'The rubric criteria and how your work was graded may not fully align. Review the table above and your letter draft.',
              color: 'bg-violet-50',
              iconColor: '#7c3aed',
            },
            {
              icon: ICONS.Library,
              title: 'Grading Consistency',
              val: 'REVIEWED',
              desc: currentCase?.analysis?.case_analysis?.fairness_review?.summary_if_marking_questionable
                ? String(currentCase.analysis.case_analysis.fairness_review.summary_if_marking_questionable)
                : 'We checked whether the grading is consistent with the stated rubric and any course policies that apply.',
              color: 'bg-teal-50',
              iconColor: '#0d9488',
            },
            {
              icon: ICONS.FileText,
              title: 'Missing Feedback',
              val: 'FLAGGED',
              desc:
                (currentCase?.analysis?.case_analysis?.unexplained_deductions?.length ?? 0) > 0
                  ? `${currentCase?.analysis?.case_analysis?.unexplained_deductions?.length} area(s) with points off but unclear explanation.`
                  : 'Points were deducted without a written explanation. You have the right to ask why marks were taken.',
              color: 'bg-amber-50',
              iconColor: '#d97706',
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white rounded-2xl p-8 flex flex-col gap-6 transition-all duration-300 hover:shadow-md border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${item.color}`}>
                  <item.icon size={22} strokeWidth={1.8} style={{ color: (item as any).iconColor }} />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">{item.val}</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-on-surface tracking-tight">{item.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-24">
          <div className="bg-white rounded-2xl p-8 space-y-8 border border-gray-100 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant leading-none">Letter Tone</h4>
            
            <div className="space-y-12 relative px-2">
              <div className="h-[4px] bg-violet-100 rounded-full w-full relative">
                 <motion.div
                   animate={{ left: `${tone}%` }}
                   className="absolute -top-[6px] -ml-2 w-4 h-4 rounded-full cursor-pointer border-2 border-white shadow-lg"
                   style={{ background: '#7c3aed' }}
                 />
                 <input 
                   type="range" 
                   min="0" max="100" 
                   value={tone}
                   onChange={(e) => setTone(parseInt(e.target.value))}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                 />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <span>Analytical</span>
                <span>Assertive</span>
              </div>
            </div>
            
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {tone < 33 ? 'Calm and analytical — best for straightforward rubric errors.' : tone < 66 ? 'Balanced — professional and firm without being aggressive.' : 'Assertive — clearly pushes back on the grading decision.'}
            </p>
          </div>

          <div className="space-y-8 pl-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant leading-none">Review Pipeline</h4>
            <div className="space-y-16 relative">
              <div className="absolute left-[-32px] top-4 bottom-4 w-[2px] bg-gray-100" />
              {[
                { step: 1, title: 'Review the Analysis', desc: 'Check the findings and confirm they match what happened.', active: true },
                { step: 2, title: 'Review the Letter', desc: 'Read your draft and adjust the tone if needed.', active: false },
                { step: 3, title: 'Submit Your Appeal', desc: 'Send the letter to your professor or review committee.', active: false },
              ].map((s, idx) => (
                <div key={idx} className="relative group">
                  <div className={`absolute -left-[43px] top-1 w-6 h-6 rounded-xl border-2 bg-white transition-all shadow-sm ${
                    s.active ? 'scale-110 border-violet-600' : 'border-gray-200'
                  }`} style={s.active ? { background: '#7c3aed' } : undefined} />
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 leading-none ${s.active ? '' : 'text-on-surface-variant/40'}`}
                    style={s.active ? { color: '#7c3aed' } : undefined}>
                    PHASE {s.step}: {s.title}
                  </p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paper Editor */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-sm rounded-2xl p-10 md:p-16 min-h-[800px] w-full border border-gray-100 flex flex-col relative transition-all"
          >
            <header className="border-b-2 border-gray-100 pb-10 mb-10 flex justify-between items-start relative z-10">
              <div className="space-y-4">
                {[
                  { label: 'TO:', val: 'Professor / Academic Review Committee' },
                  { label: 'FROM:', val: 'Student (You)' },
                  { label: 'DATE:', val: currentCase?.createdAt?.toDate ? currentCase.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString() },
                  { label: 'RE:', val: currentCase?.title || 'Grade Appeal' }
                ].map((row, i) => (
                  <div key={i} className="flex gap-6">
                     <p className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px] min-w-[70px] mt-[1px]">{row.label}</p>
                     <p className={`text-base font-medium ${row.label === 'CASE:' ? 'font-bold italic' : 'text-on-surface'}`} style={row.label === 'CASE:' ? { color: '#7c3aed' } : undefined}>{row.val}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-violet-50 rounded-xl text-violet-300 hover:text-violet-600 transition-all cursor-pointer border border-violet-100 active:scale-95">
                <ICONS.Edit size={24} />
              </div>
            </header>

            <div className="flex-grow text-base text-on-surface/85 space-y-6 leading-relaxed text-justify relative z-10">
              <p className="text-xl font-semibold mb-8 text-on-surface tracking-tight">Dear Professor / Review Committee,</p>

              <p>
                I am writing to formally request a reconsideration of the grade I received on{' '}
                <span className="bg-violet-50 border-b border-violet-300 px-1 mx-1 inline-block pb-0.5">
                  {currentCase?.title || 'my recent assignment'}
                </span>.
                After carefully reviewing my work against the rubric and the feedback provided, I believe there are specific areas where the grading may not accurately reflect my performance.
              </p>

              <p>
                {currentCase?.analysis?.case_analysis?.strongest_appeal_points?.[0]
                  ? `Specifically, ${currentCase.analysis.case_analysis.strongest_appeal_points[0]}`
                  : 'In particular, I noticed that certain deductions were made without a written explanation tied to a specific rubric criterion, which makes it difficult to understand what was expected and how to improve.'}
              </p>

              <p>
                {currentCase?.analysis?.case_analysis?.strongest_appeal_points?.[1]
                  ? currentCase.analysis.case_analysis.strongest_appeal_points[1]
                  : 'I have reviewed the grading rubric in detail and believe that my submission met the stated criteria for the points in question. I am happy to discuss this further and provide any additional context that would be helpful.'}
              </p>

              <p className="pt-8 text-xl">
                I appreciate your time and I am open to a conversation about this. I am not disputing the grading lightly — I simply want to make sure the evaluation reflects my actual work.
              </p>

              <div className="pt-10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Signed</p>
                <p className="font-serif italic text-3xl font-light text-on-surface/90">Your Name</p>
              </div>
            </div>

            <footer className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center opacity-40 relative z-10">
              <p className="text-[9px] font-bold tracking-wider uppercase text-on-surface-variant">Generated by Regrade</p>
              <p className="text-[9px] text-on-surface-variant font-mono">{new Date().toLocaleDateString()}</p>
            </footer>
          </motion.div>
        </div>
      </div>

      {/* Persistent Action Bar */}
      <div className="sticky bottom-16 left-0 right-0 z-50 flex justify-center px-4">
        <motion.div 
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-5xl w-full rounded-2xl py-5 px-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl text-white border border-white/10"
          style={{ background: '#1a1033' }}
        >
          <div className="flex items-center gap-10">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 leading-none mb-1">Status</span>
               <span className="text-xs font-bold tracking-wider uppercase text-teal-400">Appeal Letter Ready</span>
             </div>
             <div className="h-12 w-px bg-white/10 hidden md:block" />
          </div>
          <div className="flex gap-4 sm:gap-6 w-full md:w-auto">
             <button type="button" className="flex-1 md:flex-none flex items-center justify-center gap-2 min-h-[2.75rem] px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-semibold text-white/70">
               <ICONS.Download size={18} /> Download PDF
             </button>
             <button
               type="button"
               onClick={onFinalize}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 min-h-[2.75rem] px-6 py-3 rounded-xl text-white transition-all text-xs font-semibold shadow-lg border border-white/20 active:scale-[0.98] hover:opacity-90"
               style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0d9488 100%)' }}
             >
               View Full Report <ICONS.ArrowRight size={22} />
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
