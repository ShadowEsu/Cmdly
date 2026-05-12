import React from 'react';
import { ICONS } from '../constants';

export default function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-surface paper-texture p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-primary/70 hover:text-primary text-sm font-bold uppercase tracking-widest min-h-[44px]"
        >
          <ICONS.ChevronLeft size={18} />
          Back
        </button>

        <h1 className="font-serif text-3xl text-primary font-light tracking-tight mb-2">Privacy</h1>
        <p className="text-xs text-primary/45 uppercase tracking-widest mb-10">Regrade — student grade appeal assistant</p>

        <div className="space-y-6 text-on-surface-variant text-sm leading-relaxed font-serif">
          <section className="space-y-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/60">What we collect</h2>
            <p>
              When you sign in, Firebase Authentication may process your email address and display name. Firestore stores
              your profile fields and appeal cases you create in the app. Files you upload are processed to produce
              analysis; do not upload more personal data than your appeal requires.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/60">AI processing</h2>
            <p>
              Text and images you submit may be sent to our server and then to Google&apos;s Gemini models for security
              screening, document analysis, and the appeal chat assistant. This is <strong className="font-medium text-primary">not</strong>{' '}
              legal advice and <strong className="font-medium text-primary">not</strong> a guarantee of grade outcomes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/60">Your controls</h2>
            <p>
              You can sign out at any time. To delete account data hosted in Firebase, contact support with the email you
              used to register; retention and school policies may also apply to copies you sent to instructors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/60">Updates</h2>
            <p>
              This summary is for transparency before you ship store listings with a full legal privacy policy URL.
              Replace or extend it with counsel-approved text and link that URL from the store and your website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
