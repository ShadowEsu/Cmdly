import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { applyActionCode, auth, firebaseReady, reload } from './lib/firebase';
import Auth from './views/Auth';
import VerifyEmail from './views/VerifyEmail';
import { ICONS } from './constants';
import { userService } from './services/userService';
import { formatFirebaseAuthError } from './lib/authErrors';
import { setPostVerifyNotice } from './lib/authSession';

function parseEmailActionFromUrl(): { mode: string | null; oobCode: string | null } {
  if (typeof window === 'undefined') return { mode: null, oobCode: null };
  const url = new URL(window.location.href);
  let mode = url.searchParams.get('mode');
  let oobCode = url.searchParams.get('oobCode');
  if (!mode && url.hash.length > 1) {
    const h = new URLSearchParams(url.hash.replace(/^#/, ''));
    mode = h.get('mode');
    oobCode = h.get('oobCode');
  }
  return { mode, oobCode };
}

function stripEmailActionFromUrl() {
  const url = new URL(window.location.href);
  for (const key of ['mode', 'oobCode', 'apiKey', 'continueUrl', 'lang']) {
    url.searchParams.delete(key);
  }
  const qs = url.searchParams.toString();
  window.history.replaceState({}, document.title, `${url.pathname}${qs ? `?${qs}` : ''}`);
}

interface AuthGateProps {
  children: React.ReactNode;
}

function needsEmailVerification(u: { emailVerified: boolean; providerData: { providerId: string }[] }): boolean {
  if (u.emailVerified) return false;
  return u.providerData.some((p) => p.providerId === 'password');
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailLinkBusy, setEmailLinkBusy] = useState(false);
  const [emailLinkError, setEmailLinkError] = useState<string | null>(null);

  /** Complete email verification when Firebase redirects back with ?mode=verifyEmail&oobCode=… */
  useEffect(() => {
    if (!firebaseReady) return;
    const { mode, oobCode } = parseEmailActionFromUrl();
    if (mode !== 'verifyEmail' || !oobCode) return;

    const dedupeKey = `regrade_verify_oob_${oobCode}`;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
      sessionStorage.setItem(dedupeKey, '1');
    } catch {
      /* ignore */
    }

    setEmailLinkBusy(true);
    setEmailLinkError(null);
    void (async () => {
      try {
        await applyActionCode(auth, oobCode);
        stripEmailActionFromUrl();
        if (auth.currentUser) {
          await reload(auth.currentUser);
        } else {
          setPostVerifyNotice('Your email is verified. Sign in with your email and password below.');
        }
        window.location.reload();
      } catch (err: unknown) {
        console.error('Email action link failed:', err);
        try {
          sessionStorage.removeItem(dedupeKey);
        } catch {
          /* ignore */
        }
        stripEmailActionFromUrl();
        setEmailLinkError(formatFirebaseAuthError(err));
        setEmailLinkBusy(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        try {
          await userService.syncProfile(u.uid, {
            name: u.displayName || '',
            email: u.email || '',
            avatarUrl: u.photoURL || ''
          });
        } catch (err) {
          console.error("Institutional profile out of sync:", err);
        }
      }
    });
    return unsub;
  }, []);

  if (emailLinkBusy || loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 paper-texture">
        <div className="text-center space-y-4 max-w-sm">
          <ICONS.AILogo className="animate-spin text-primary mx-auto" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
            {emailLinkBusy ? 'Completing email verification…' : 'Verifying Identity Integrity...'}
          </p>
        </div>
      </div>
    );
  }

  if (!firebaseReady) {
    // Allow the UI to boot without blocking on auth when Firebase isn't configured yet.
    // A console warning is emitted from `src/lib/firebase.ts` with the missing keys.
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="relative min-h-screen">
        {emailLinkError ? (
          <div className="sticky top-0 z-[100] border-b border-red-100 bg-red-50 px-4 py-3 text-center">
            <p className="text-xs font-bold text-red-700 leading-relaxed max-w-lg mx-auto">{emailLinkError}</p>
            <button
              type="button"
              onClick={() => setEmailLinkError(null)}
              className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-600/80 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        ) : null}
        <Auth />
      </div>
    );
  }

  if (needsEmailVerification(user)) {
    return <VerifyEmail />;
  }

  return <>{children}</>;
};

export default AuthGate;
