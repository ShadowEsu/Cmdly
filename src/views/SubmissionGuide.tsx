import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';

type Platform = 'canvas' | 'gradescope' | 'moodle' | 'blackboard' | 'google' | 'd2l' | 'turnitin' | 'unsure' | null;

const platformInfo: Record<Exclude<Platform, null>, {
  name: string;
  steps: { step: number; title: string; description: string }[];
  deadline?: string;
}> = {
  canvas: {
    name: 'Canvas',
    steps: [
      {
        step: 1,
        title: 'Email Your Professor',
        description: 'Use Canvas Messaging or send a direct email. Keep it professional—reference the assignment and your concerns about the grade.'
      },
      {
        step: 2,
        title: 'Wait 5–7 Days',
        description: 'Give your professor time to respond. Canvas Messaging typically notifies them automatically.'
      },
      {
        step: 3,
        title: 'Escalate If Needed',
        description: 'If denied or no response, contact your department chair or academic dean. Provide copies of your correspondence with the professor.'
      }
    ],
    deadline: 'Most institutions require appeals within 10–30 days of the grade posting. Check your school\'s academic calendar.'
  },
  gradescope: {
    name: 'Gradescope',
    steps: [
      {
        step: 1,
        title: 'Use Regrade Request',
        description: 'Open your assignment in Gradescope. Click the "Request Regrade" button next to your score. Gradescope has a built-in regrade workflow.'
      },
      {
        step: 2,
        title: 'Write Your Request',
        description: 'Explain which questions you believe were graded incorrectly. Reference specific rubric criteria or calculation errors.'
      },
      {
        step: 3,
        title: 'Wait for Professor Decision',
        description: 'The professor will review your regrade request in Gradescope. They will either accept or deny it. The timeline is typically 5–10 days.'
      }
    ],
    deadline: 'Check your syllabus or Gradescope assignment settings for the regrade deadline (often 7–14 days after grading).'
  },
  moodle: {
    name: 'Moodle',
    steps: [
      {
        step: 1,
        title: 'Message Your Professor',
        description: 'Use Moodle Messaging or email directly. Explain your grade concern and reference the assignment.'
      },
      {
        step: 2,
        title: 'Wait 5–7 Days',
        description: 'Give your instructor time to respond. Moodle Messaging will notify them.'
      },
      {
        step: 3,
        title: 'Escalate If Needed',
        description: 'If denied or no response, contact the department chair or dean. Include copies of your correspondence.'
      }
    ],
    deadline: 'Most schools require appeals within 10–30 days of the grade being posted.'
  },
  blackboard: {
    name: 'Blackboard',
    steps: [
      {
        step: 1,
        title: 'Review in Grade Center',
        description: 'Go to the assignment in Blackboard Grade Center. Click the grade to see any feedback or comments the professor left.'
      },
      {
        step: 2,
        title: 'Email Your Professor',
        description: 'Send a professional email referencing the assignment and your appeal concerns.'
      },
      {
        step: 3,
        title: 'Escalate If Needed',
        description: 'If denied, contact your department chair or academic dean with documentation of your appeal.'
      }
    ],
    deadline: 'Most institutions require appeals within 10–30 days of the grade being posted.'
  },
  google: {
    name: 'Google Classroom',
    steps: [
      {
        step: 1,
        title: 'Post a Comment',
        description: 'Click the assignment in Google Classroom. Add a comment expressing your concern about the grade professionally.'
      },
      {
        step: 2,
        title: 'Follow Up with Email',
        description: 'Send a separate email to your teacher with your formal appeal letter and additional context.'
      },
      {
        step: 3,
        title: 'Escalate If Needed',
        description: 'If your teacher denies the appeal, escalate to your department chair or school administration.'
      }
    ],
    deadline: "Check your school's deadline policy (typically 10–30 days from the grade posting date)."
  },
  d2l: {
    name: 'D2L Brightspace',
    steps: [
      {
        step: 1,
        title: 'Message Your Instructor',
        description: 'Use D2L Messaging to contact your instructor. Explain which assignment and what your concern is.'
      },
      {
        step: 2,
        title: 'Wait 5–7 Days',
        description: 'Give your instructor time to respond through D2L.'
      },
      {
        step: 3,
        title: 'Escalate If Needed',
        description: 'If denied, escalate to the department chair or dean with copies of your messages.'
      }
    ],
    deadline: 'Most institutions require appeals within 10–30 days of the grade being posted.'
  },
  turnitin: {
    name: 'Turnitin',
    steps: [
      {
        step: 1,
        title: 'Appeal Through Your LMS First',
        description: "Turnitin grades are submitted through Canvas, Moodle, or Blackboard. Appeal through your school's LMS platform instead."
      },
      {
        step: 2,
        title: 'Email Your Professor',
        description: 'Reference the Turnitin submission and explain your grade concern. Include a copy of the graded paper.'
      },
      {
        step: 3,
        title: 'Escalate If Needed',
        description: 'If no response, contact your department chair or academic dean with documentation.'
      }
    ],
    deadline: "Follow your institution's standard appeal timeline (usually 10–30 days)."
  },
  unsure: {
    name: 'Not Sure / Other Platform',
    steps: [
      {
        step: 1,
        title: 'Email Your Professor',
        description: 'Send a professional email explaining your grade concern. Reference the assignment and provide specific examples. Include your appeal letter.'
      },
      {
        step: 2,
        title: 'Escalate to Department Chair',
        description: "If your professor denies the appeal or doesn't respond within 5–7 days, contact the department chair. Include copies of your correspondence with the professor."
      },
      {
        step: 3,
        title: 'Escalate to Dean of Academic Affairs',
        description: 'If the department chair cannot resolve it, appeal to the dean of academic affairs or student ombudsman. Provide all documentation.'
      }
    ],
    deadline: "Check your school's student handbook or registrar office for appeal deadlines (typically 10–30 days from grade posting)."
  }
};

const platformCards = [
  { id: 'canvas', name: 'Canvas', icon: ICONS.BookOpen },
  { id: 'gradescope', name: 'Gradescope', icon: ICONS.FileText },
  { id: 'moodle', name: 'Moodle', icon: ICONS.Library },
  { id: 'blackboard', name: 'Blackboard', icon: ICONS.Landmark },
  { id: 'google', name: 'Google Classroom', icon: ICONS.Search },
  { id: 'd2l', name: 'D2L Brightspace', icon: ICONS.Activity },
  { id: 'turnitin', name: 'Turnitin', icon: ICONS.Shield },
  { id: 'unsure', name: 'Not Sure', icon: ICONS.AlertCircle }
];

export default function SubmissionGuide() {
  const [platform, setPlatform] = useState<Platform>(null);
  const info = platform && platformInfo[platform];

  return (
    <div className="space-y-24 max-w-7xl mx-auto">
      {/* Header */}
      <section className="space-y-16 py-12">
        <div className="flex items-center gap-6">
          <div className="h-px bg-primary/20 w-32" />
          <span className="text-[13px] sm:text-sm font-light tracking-[0.45em] text-primary opacity-50 uppercase">
            Submit Your Appeal
          </span>
        </div>

        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-primary font-light leading-none tracking-tight -ml-2">
          {platform ? `Submitting via ${info?.name}` : 'Where to Submit'}
        </h1>

        {platform && (
          <button
            onClick={() => setPlatform(null)}
            className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-sm font-light"
          >
            <ICONS.ChevronLeft size={16} />
            Back to platform selector
          </button>
        )}
      </section>

      {/* Platform Selector */}
      {!platform && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <p className="text-lg text-on-surface-variant font-serif italic leading-relaxed max-w-3xl">
            Select the learning platform your school uses for this course. This will show you the exact steps to submit your appeal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setPlatform(card.id as Platform)}
                  className="glass-panel p-8 rounded-[2rem] border border-primary/10 hover:border-primary/30 hover:bg-white transition-all group text-left space-y-4 flex flex-col"
                >
                  <div className="p-3 bg-primary/5 rounded-xl w-fit group-hover:bg-primary/10 transition-colors">
                    <Icon size={24} className="text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-lg font-serif text-primary font-light">{card.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Steps Display */}
      {platform && info && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-20"
        >
          {/* Deadline Reminder */}
          <div className="glass-panel rounded-[3rem] p-8 sm:p-12 border border-primary/10 bg-primary/[0.02] space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg mt-1 flex-shrink-0">
                <ICONS.AlertCircle size={20} className="text-primary" />
              </div>
              <p className="text-base sm:text-lg text-primary/80 font-serif italic leading-relaxed">
                {info.deadline}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {info.steps.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-8 sm:gap-12 items-stretch"
              >
                {/* Step Number */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-2xl sm:text-3xl font-light text-primary">{item.step}</span>
                  </div>
                  {idx < info.steps.length - 1 && (
                    <div className="w-1 flex-1 bg-primary/10 rounded-full" />
                  )}
                </div>

                {/* Step Content */}
                <div className="glass-panel p-8 sm:p-10 rounded-[2rem] border border-primary/10 hover:border-primary/20 transition-all flex-1 space-y-4 my-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-primary font-light">{item.title}</h3>
                  <p className="text-base sm:text-lg text-on-surface-variant font-serif italic leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-12 border-t border-primary/10">
            <button
              onClick={() => setPlatform(null)}
              className="px-10 sm:px-16 py-6 sm:py-8 rounded-[2.5rem] font-light uppercase tracking-[0.32em] text-[11px] sm:text-xs border-2 border-primary/10 text-primary hover:bg-primary/5 transition-all"
            >
              Change Platform
            </button>
            <button
              className="bg-primary text-white px-10 sm:px-16 py-6 sm:py-8 rounded-[2.5rem] font-light uppercase tracking-[0.32em] text-[11px] sm:text-xs hover:shadow-[0_20px_50px_rgba(0,35,111,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group"
            >
              Ready to Submit
              <ICONS.ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
            </button>
          </div>
        </motion.section>
      )}
    </div>
  );
}
