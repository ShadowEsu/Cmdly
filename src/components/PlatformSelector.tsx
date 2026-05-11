import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS } from '../constants';

type Platform = 'gradescope' | 'canvas' | 'moodle' | 'blackboard' | 'google-classroom' | 'd2l' | 'turnitin' | 'other' | null;

const GRADESCOPE_EXAMPLE_PATHS = {
  downloadOriginalVsGraded: '/gradescope/examples/01-download-original-vs-graded.png',
  downloadGradedCopyButton: '/gradescope/examples/02-download-graded-copy-button.png',
  assignmentViewToolbar: '/gradescope/examples/03-assignment-view-with-toolbar.png',
  scoreSummary: '/gradescope/examples/04-score-summary-example.png',
} as const;

const PLATFORMS = [
  { id: 'canvas', label: 'Canvas', icon: '🎨' },
  { id: 'gradescope', label: 'Gradescope', icon: '✓' },
  { id: 'moodle', label: 'Moodle', icon: '🎓' },
  { id: 'blackboard', label: 'Blackboard', icon: '⬛' },
  { id: 'google-classroom', label: 'Google Classroom', icon: '📚' },
  { id: 'd2l', label: 'D2L Brightspace', icon: '◆' },
  { id: 'turnitin', label: 'Turnitin', icon: '🔍' },
  { id: 'other', label: 'Not sure / Other', icon: '❓' },
] as const;

interface PlatformInstructions {
  [key: string]: {
    title: string;
    steps: string[];
    images?: { src: string; alt: string; caption: string }[];
  };
}

const PLATFORM_INSTRUCTIONS: PlatformInstructions = {
  gradescope: {
    title: 'Get your graded copy from Gradescope',
    steps: [
      'Open your graded submission in Gradescope (the page with your score and questions).',
      'Scroll to the bottom and click Download Graded Copy — not "Download Original". The graded PDF includes marks, rubric, and feedback.',
      'Save the file, then drag it into the upload box above (or tap to choose it).',
    ],
    images: [
      {
        src: GRADESCOPE_EXAMPLE_PATHS.downloadOriginalVsGraded,
        alt: 'Example: Gradescope toolbar showing Download Original and Download Graded Copy',
        caption: 'Choose Download Graded Copy (right), not Original.',
      },
      {
        src: GRADESCOPE_EXAMPLE_PATHS.downloadGradedCopyButton,
        alt: 'Example: Download Graded Copy button close-up',
        caption: 'This is the file Regrade reads best.',
      },
      {
        src: GRADESCOPE_EXAMPLE_PATHS.assignmentViewToolbar,
        alt: 'Example: Gradescope graded assignment view with download buttons at the bottom',
        caption: 'Buttons are usually at the bottom of the graded submission view.',
      },
      {
        src: GRADESCOPE_EXAMPLE_PATHS.scoreSummary,
        alt: 'Example: Gradescope score summary with total points and per-question scores',
        caption: 'The graded PDF usually includes this kind of breakdown — the AI uses it automatically.',
      },
    ],
  },
  canvas: {
    title: 'Get your graded copy from Canvas',
    steps: [
      'Go to Grades → your course → the assignment.',
      'Open your submission and view the SpeedGrader feedback.',
      'Download the marked file if you see a download button; otherwise print the feedback page to PDF so rubric and comments stay visible.',
    ],
  },
  moodle: {
    title: 'Get your graded copy from Moodle',
    steps: [
      'Open the assignment → your submission → Feedback (files or comments your instructor returned).',
      'Download the annotated PDF if one is attached.',
      'If only text feedback is shown, take a screenshot or print that page to PDF.',
    ],
  },
  blackboard: {
    title: 'Get your graded copy from Blackboard',
    steps: [
      'Go to My Grades → the item → view attempt / feedback.',
      'Save any returned file from your instructor.',
      'If the feedback is only on screen, capture it or print that view to PDF.',
    ],
  },
  'google-classroom': {
    title: 'Get your graded copy from Google Classroom',
    steps: [
      'Go to Classwork → the assignment → your turned-in work.',
      'Open the returned Doc/PDF in Google Drive; instructor comments usually show in the file.',
      'Export or print to PDF if needed, then save the file.',
    ],
  },
  'd2l': {
    title: 'Get your graded copy from D2L Brightspace',
    steps: [
      'Go to Assignments → your submission → Feedback.',
      'Use the feedback view your instructor left.',
      'Download attachments or print the feedback page to PDF.',
    ],
  },
  turnitin: {
    title: 'Get your graded copy from Turnitin Feedback Studio',
    steps: [
      'Open your submission in Feedback Studio.',
      'If your school allows it, download or print the version with inline instructor comments.',
      'Hide the similarity layer if you only need grading marks.',
    ],
  },
  other: {
    title: 'Get your graded copy',
    steps: [
      'Look for the page or file that shows your grade, rubric, and professor comments together.',
      'If you can see your score and feedback on screen, take a clear photo or screenshot.',
      'If there\'s a download option, use it. Otherwise, use "Save as PDF" or "Print to PDF" to save that page.',
      'Upload the PDF or photo below.',
    ],
  },
};

export default function PlatformSelector() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);

  return (
    <AnimatePresence mode="wait">
      {selectedPlatform === null ? (
        <motion.div
          key="selector"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="rounded-2xl md:rounded-[2rem] p-6 md:p-8 space-y-6 border border-primary/10 bg-white"
        >
          <div>
            <h2 className="font-serif text-xl md:text-2xl text-primary font-medium tracking-tight mb-2">
              Which platform does your school use?
            </h2>
            <p className="text-sm text-primary/65 font-serif">
              We'll show you exactly where to find your graded copy.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {PLATFORMS.map((platform) => (
              <motion.button
                key={platform.id}
                type="button"
                onClick={() => setSelectedPlatform(platform.id as Platform)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border-2 border-primary/15 bg-white hover:border-primary/40 hover:bg-primary/[0.03] transition-all active:ring-2 active:ring-primary/30"
              >
                <span className="text-3xl md:text-4xl">{platform.icon}</span>
                <span className="text-xs md:text-sm font-semibold text-primary text-center leading-tight">
                  {platform.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="instructions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-2xl md:rounded-[2rem] p-6 md:p-8 space-y-6 border border-primary/10 bg-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl md:text-2xl text-primary font-medium tracking-tight">
                {PLATFORM_INSTRUCTIONS[selectedPlatform].title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlatform(null)}
              className="text-[11px] font-semibold uppercase tracking-widest text-primary/50 hover:text-primary border border-primary/15 rounded-lg px-3 py-2 transition-colors whitespace-nowrap"
            >
              Change platform
            </button>
          </div>

          <ol className="list-decimal space-y-3 pl-5 text-[13px] leading-relaxed text-primary/85 font-serif marker:font-sans marker:text-primary/50 marker:font-semibold">
            {PLATFORM_INSTRUCTIONS[selectedPlatform].steps.map((step, idx) => (
              <li key={idx} className="text-primary/85">
                {step}
              </li>
            ))}
          </ol>

          {PLATFORM_INSTRUCTIONS[selectedPlatform].images && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-4">
              {PLATFORM_INSTRUCTIONS[selectedPlatform].images!.map((img, idx) => (
                <figure
                  key={idx}
                  className="overflow-hidden rounded-lg border border-primary/10 bg-white shadow-sm"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full object-contain object-top max-h-48 bg-black/[0.03]"
                    loading="lazy"
                  />
                  <figcaption className="border-t border-primary/5 px-3 py-2 text-[11px] text-primary/60 leading-snug">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-primary/5">
            <p className="text-[12px] text-primary/60 font-serif leading-relaxed">
              Once you have your graded copy, drag it into the upload box below or tap to choose it. Regrade works with{' '}
              <strong className="font-medium">any PDF or clear photos</strong> — if you can see your grade and professor comments, we
              can analyze it.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
