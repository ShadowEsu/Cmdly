import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';
import { caseService, Case } from '../services/caseService';

export default function VerdictReport({ caseId }: { caseId: string | null }) {
  const [currentCase, setCurrentCase] = useState<Case | null>(null);

  useEffect(() => {
    if (caseId) {
      caseService.getCaseById(caseId).then(data => {
        if (data) setCurrentCase(data);
      });
    }
  }, [caseId]);

  const analysis = currentCase?.analysis;

  const recoverablePts =
    (analysis?.case_analysis.potential_calculation_errors?.reduce((a, c) => a + (Number(c.discrepancy) || 0), 0) ?? 0) +
    (analysis?.case_analysis.unexplained_deductions?.reduce((a, c) => a + (Number(c.points_lost) || 0), 0) ?? 0);

  const totalPointsLost =
    analysis?.questions?.reduce((acc, q) => acc + (q.points_lost != null ? Number(q.points_lost) : 0), 0) ?? null;
  const qCount = analysis?.questions?.length ?? 0;
  const confPct =
    analysis?.confidence?.overall_confidence != null
      ? Math.round(analysis.confidence.overall_confidence * 100)
      : null;
  const alignPct =
    analysis?.case_analysis?.rubric_alignment_score != null
      ? Math.round(analysis.case_analysis.rubric_alignment_score * 100)
      : null;

  return (
    <div className="space-y-24 max-w-7xl mx-auto">
      {/* Hero Verdict */}
      <section className="space-y-16 py-12">
        <div className="flex items-center gap-6">
          <div className="h-px bg-gray-200 w-20" />
          <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
            Case ID: {currentCase?.ref || '—'}
          </span>
        </div>

        <h1 className="font-bold text-5xl md:text-7xl text-on-surface leading-none tracking-tight">
          Audit <span className="font-light italic text-on-surface-variant block lg:inline">Verdict</span>
        </h1>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 border-t border-gray-100 pt-10">
          <div className="space-y-6 max-w-4xl">
            <h2 className="font-bold text-3xl md:text-5xl text-on-surface tracking-tight leading-snug">
              {analysis?.case_analysis.overall_case_strength === 'strong' ? 'Strong Grounds for Appeal' :
               analysis?.case_analysis.overall_case_strength === 'moderate' ? 'Some Grounds for Appeal' :
               analysis?.case_analysis.overall_case_strength === 'weak' ? 'Limited Grounds for Appeal' : 'Analyzing Your Case'}
            </h2>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed font-medium">
              {analysis?.case_analysis.case_strength_reason || "Review the findings below to understand your options."}
            </p>
          </div>
          
          <div className="flex flex-col items-center xl:items-end gap-2 bg-violet-50 p-8 sm:p-10 rounded-2xl border border-violet-100 max-w-full">
            <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1 text-center xl:text-right">
              Possible point issues flagged
            </div>
            {analysis && recoverablePts > 0 ? (
              <div className="flex items-baseline gap-3">
                <span className="text-6xl sm:text-7xl font-bold tracking-tight leading-none" style={{ color: '#7c3aed' }}>
                  +{recoverablePts}
                </span>
                <span className="text-xl font-medium text-on-surface-variant">pts</span>
              </div>
            ) : analysis ? (
              <p className="text-sm font-medium text-on-surface-variant text-center xl:text-right max-w-sm leading-snug">
                No extra points were automatically estimated from the text you supplied. That does not mean an appeal is
                impossible—only that the model did not find a clear arithmetic or rubric mismatch.
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant">Loading analysis…</p>
            )}
            <p className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant mt-3 text-center xl:text-right leading-relaxed">
              Not a grade guarantee — educational review only
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-12">
          <button
            type="button"
            className="text-white px-8 py-3 rounded-xl font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center gap-3 group w-full sm:w-auto justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0d9488 100%)' }}
          >
            Write appeal letter
            <ICONS.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            type="button"
            className="bg-white border border-gray-200 text-on-surface px-8 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all w-full sm:w-auto"
          >
            Download evidence
          </button>
        </div>
      </section>

      {/* Discovery Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Probability Meter (Bento) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-12 bg-white rounded-2xl p-12 flex flex-col items-center text-center relative overflow-hidden border border-gray-100 shadow-sm"
        >
          <div className="absolute inset-0 paper-texture opacity-10 pointer-events-none" />
          
          <div className="space-y-3 mb-10">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Analysis signal</h3>
            <div className="h-px w-20 bg-gray-200 mx-auto" />
          </div>

          <div className="relative w-full max-w-3xl flex flex-col items-center justify-center">
             <div className="flex items-baseline gap-3">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="font-bold text-7xl sm:text-8xl tracking-tight leading-none"
                  style={{ color: '#7c3aed' }}
                >
                  {confPct ?? '—'}
                </motion.span>
                <span className="text-5xl font-bold text-on-surface-variant/30 leading-none">%</span>
             </div>
             <p className="text-sm text-on-surface-variant mt-3 max-w-xl mx-auto px-2">
               Model confidence in this reading — not your odds of winning a formal appeal
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-10 pt-8 border-t border-gray-100">
             <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Rubric alignment (model)</p>
                <p className="text-4xl font-bold tracking-tight" style={{ color: '#7c3aed' }}>
                  {alignPct != null ? `${alignPct}%` : '—'}
                </p>
             </div>
             <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Points lost (from extract)</p>
                <p className="text-4xl font-bold tracking-tight" style={{ color: '#7c3aed' }}>
                  {totalPointsLost != null && qCount > 0 ? totalPointsLost : '—'}
                </p>
             </div>
             <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Questions parsed</p>
                <p className="text-4xl font-bold tracking-tight" style={{ color: '#7c3aed' }}>{qCount > 0 ? qCount : '—'}</p>
             </div>
          </div>
        </motion.div>

        {/* Intelligence Table */}
        <motion.div className="lg:col-span-7 space-y-8">
           <div className="flex items-center gap-4 mb-2">
              <h3 className="font-bold text-2xl text-on-surface">Critical Findings</h3>
              <div className="h-px flex-1 bg-gray-100" />
           </div>

           <div className="space-y-4">
             {analysis?.case_analysis.unexplained_deductions?.map((finding, i) => (
               <div key={i} className="bg-white p-6 rounded-2xl hover:shadow-md transition-all group cursor-pointer border border-gray-100 hover:-translate-y-0.5">
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-red-50 rounded-xl text-red-400 group-hover:text-red-600 transition-colors">
                        <ICONS.ShieldAlert size={18} />
                     </div>
                     <div>
                       <h4 className="font-semibold text-base text-on-surface">{finding.question_id}</h4>
                       <p className="text-xs text-on-surface-variant font-mono">Deduction: -{finding.points_lost} pts</p>
                     </div>
                   </div>
                   <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet-50 text-violet-600">Missing Feedback</span>
                 </div>
                 <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{finding.what_is_missing}</p>
                 <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant group-hover:text-violet-600 transition-all">
                    <span>View Details</span>
                    <ICONS.ArrowRight size={14} className="group-hover:translate-x-1" />
                 </div>
               </div>
             ))}

             {analysis?.case_analysis.strongest_appeal_points?.slice(0, 2).map((point, i) => (
                <div key={`appeal-${i}`} className="bg-white p-6 rounded-2xl hover:shadow-md transition-all group cursor-pointer border border-gray-100 hover:-translate-y-0.5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-violet-50 rounded-xl text-violet-400 group-hover:text-violet-600 transition-colors">
                         <ICONS.TrendingUp size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-base text-on-surface">Strategic Leverage</h4>
                        <p className="text-xs text-on-surface-variant font-mono">Appeal Angle {i+1}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-100 text-teal-700">Verified Strength</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{point}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant group-hover:text-violet-600 transition-all">
                     <span>Use This Point</span>
                     <ICONS.ArrowRight size={14} className="group-hover:translate-x-1" />
                  </div>
                </div>
             ))}
           </div>
        </motion.div>
      </div>

      {analysis?.case_analysis.fairness_review && (
        <section className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-8">
          <div className="space-y-2">
            <h3 className="font-bold text-2xl sm:text-3xl text-on-surface tracking-tight">Fairness read</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-3xl">
              The model compares what you pasted to the rubric and feedback. It is not a legal finding and cannot see
              your full course context.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-on-surface/85">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">If marking looks consistent</p>
              <p>{analysis.case_analysis.fairness_review.summary_if_marking_sound}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">If marking looks questionable</p>
              <p>{analysis.case_analysis.fairness_review.summary_if_marking_questionable}</p>
            </div>
            {analysis.case_analysis.fairness_review.teacher_may_have_erred_because && (
              <div className="md:col-span-2 space-y-2 rounded-xl bg-amber-50 border border-amber-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Possible grading concern</p>
                <p className="text-amber-900">{analysis.case_analysis.fairness_review.teacher_may_have_erred_because}</p>
              </div>
            )}
            <div className="md:col-span-2 text-sm text-on-surface-variant border-t border-gray-100 pt-6">
              {analysis.case_analysis.fairness_review.student_should_know}
            </div>
          </div>
        </section>
      )}

      {/* Teacher Profile Section */}
      <section className="rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl" style={{ background: '#1a1033' }}>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-bold text-2xl tracking-tight">Grading Pattern Analysis</h3>
            <p className="text-white/50 text-sm max-w-sm leading-relaxed">
              Synthesized grading methodology based on feedback patterns and rubric adherence.
            </p>
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-white/40">
                 <span>Grading Style: {analysis?.teacher_profile.grading_style || 'Moderate'}</span>
                 <span className="text-white">Consistency: {analysis?.teacher_profile.uses_rubric_consistently ? 'High' : 'Low'}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: analysis?.teacher_profile.uses_rubric_consistently ? '90%' : '30%' }} transition={{ delay: 1, duration: 1.5 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #0d9488)' }} />
              </div>
            </div>
            {analysis?.teacher_profile.grading_style_evidence && (
              <p className="text-xs text-white/40 font-mono leading-relaxed bg-white/5 p-4 rounded-xl italic">
                "{analysis.teacher_profile.grading_style_evidence}"
              </p>
            )}
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-2 gap-8">
             {[
               { label: 'Philosophy', val: analysis?.teacher_profile.marking_philosophy || 'Standards', sub: 'Primary Driver' },
               { label: 'Feedback Quality', val: analysis?.teacher_profile.feedback_quality || 'Adequate', sub: 'Tone Analysis' },
               { label: 'Deductions', val: analysis?.teacher_profile.deduction_pattern || 'Aligned', sub: 'Pattern Type' },
               {
                 label: 'Score ceiling (estimate)',
                 val:
                   analysis?.teacher_profile.typical_ceiling_estimate != null
                     ? `${analysis.teacher_profile.typical_ceiling_estimate}%`
                     : '—',
                 sub: 'From visible pattern only',
               }
             ].map((stat, i) => (
               <div key={i} className="space-y-1 group">
                 <p className="text-xs font-semibold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">{stat.label}</p>
                 <p className="font-bold text-2xl md:text-3xl tracking-tight truncate uppercase">{stat.val}</p>
                 <p className="text-xs font-semibold uppercase tracking-wider text-white/25">{stat.sub}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Institutional Timeline */}
      <section className="pb-16 px-2">
         <div className="flex items-center gap-3 mb-10">
            <div className="w-2 h-2 rounded-full" style={{ background: '#7c3aed' }} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Case Resolution Roadmap</h4>
            <div className="h-px flex-1 bg-gray-100" />
         </div>

         <div className="relative border-l border-gray-200 ml-4 pl-10 space-y-10 max-w-3xl">
            {[
              { status: 'DONE', isActive: true, title: 'Analysis Complete', desc: 'Regrade has reviewed your grade, rubric, and feedback for inconsistencies.' },
              { status: 'NEXT', isActive: false, pulse: true, title: 'Write Your Appeal', desc: 'Use the findings above to draft a clear, professional appeal letter.' },
              { status: 'PENDING', isActive: false, title: 'Submit to Professor', desc: 'Send your appeal to your professor or the department\'s review committee.' },
            ].map((s, idx) => (
              <div key={idx} className="relative group">
                <div
                  className={`absolute -left-[48px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${s.pulse ? 'animate-pulse' : ''}`}
                  style={{
                    background: s.isActive ? '#7c3aed' : s.pulse ? '#0d9488' : '#e5e7eb',
                  }}
                />
                <p className="text-[10px] font-bold tracking-wider uppercase mb-2 text-on-surface-variant">{s.status}</p>
                <div className="space-y-1.5">
                  <p className="font-bold text-xl text-on-surface">{s.title}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
