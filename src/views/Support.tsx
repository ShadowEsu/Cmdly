import React from 'react';
import { ICONS, SUPPORT_EMAIL } from '../constants';

export default function Support({ onBack }: { onBack: () => void }) {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=Regrade%20support`;

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

        <h1 className="font-serif text-3xl text-primary font-light tracking-tight mb-2">Support</h1>
        <p className="text-xs text-primary/45 uppercase tracking-widest mb-10">Help and pre-launch checklist</p>

        <div className="space-y-6 text-on-surface-variant text-sm leading-relaxed font-serif">
          <section className="space-y-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/60">Contact</h2>
            <p>
              Email:{' '}
              <a href={mailto} className="text-primary underline underline-offset-2 font-medium">
                {SUPPORT_EMAIL}
              </a>
              . Set <code className="text-xs bg-primary/5 px-1 rounded">SUPPORT_EMAIL</code> in{' '}
              <code className="text-xs bg-primary/5 px-1 rounded">src/constants.ts</code> before production.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/60">API and sign-in</h2>
            <p>
              Analysis and chat require a deployed API with <code className="text-xs bg-primary/5 px-1 rounded">GEMINI_API_KEY</code> and
              Firebase Admin for token verification. The web app must set <code className="text-xs bg-primary/5 px-1 rounded">VITE_API_BASE_URL</code>{' '}
              for production and Capacitor builds. Allow your hosting and native origins in the API&apos;s{' '}
              <code className="text-xs bg-primary/5 px-1 rounded">CORS_ORIGIN</code>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-primary/60">App Store and Play</h2>
            <p>
              Before public release: run closed testing (TestFlight on iOS, internal or closed testing on Google Play),
              attach your final privacy policy URL, declare AI-assisted features per store guidelines, and verify Google
              sign-in with your production bundle IDs and SHA fingerprints in Firebase.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
