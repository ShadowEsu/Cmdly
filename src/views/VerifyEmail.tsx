import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, getAuthActionCodeSettings, reload, sendEmailVerification, signOut } from '../lib/firebase';
import { formatFirebaseAuthError } from '../lib/authErrors';
import { ICONS } from '../constants';
import Logo from '../components/Logo';

/**
 * Shown when a password-based account is signed in but the address is not verified yet.
 * Google and other OAuth providers typically arrive already verified.
 */
const VerifyEmail: React.FC = () => {
  const user = auth.currentUser;
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return null;
  }

  const ac = getAuthActionCodeSettings();

  const onResend = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await sendEmailVerification(user, ac ?? undefined);
      setNotice('Another verification email is on its way. Check your inbox and spam folder.');
    } catch (e: unknown) {
      setError(formatFirebaseAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const onReload = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        setNotice('Email verified — loading your workspace…');
        window.setTimeout(() => window.location.reload(), 400);
      } else {
        setError('Still not verified. Open the link in the email we sent, then tap “I’ve verified”.');
      }
    } catch (e: unknown) {
      setError(formatFirebaseAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = async () => {
    setBusy(true);
    try {
      await signOut(auth);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 paper-texture">
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 shadow-[0_0_15px_rgba(0,35,111,0.2)]" />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" className="mb-4 !p-0" />
          <h2 className="font-serif text-3xl sm:text-4xl text-primary/80 font-light tracking-tight mb-2">Verify your email</h2>
          <p className="text-on-surface-variant text-sm font-serif leading-relaxed opacity-80 px-2">
            We sent a link to{' '}
            <span className="font-semibold text-primary">{user.email || 'your email address'}</span>. Open it on this device or any
            device, then return here and tap <span className="font-semibold">I&apos;ve verified</span>.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-primary/10 space-y-4">
          {notice ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold leading-relaxed flex items-start gap-3">
              <ICONS.CheckCircle2 size={16} className="shrink-0" />
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold leading-relaxed flex items-start gap-3">
              <ICONS.AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          ) : null}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={onReload}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold tracking-widest uppercase text-xs shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 min-h-[48px]"
            >
              {busy ? <ICONS.AILogo className="animate-spin mx-auto" size={18} /> : "I've verified — continue"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onResend}
              className="w-full border border-primary/15 py-4 rounded-xl font-bold tracking-widest uppercase text-[10px] text-primary/70 hover:bg-primary/5 transition-all disabled:opacity-50 min-h-[48px]"
            >
              Resend verification email
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onSignOut}
              className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors min-h-[44px]"
            >
              Sign out
            </button>
          </div>

          <p className="text-[10px] text-center text-primary/35 font-serif leading-relaxed pt-4 border-t border-primary/5">
            <strong className="font-semibold text-primary/50">Google sign-in</strong> may show a passkey or security prompt — wait
            until it finishes. Email/password accounts must open the verification link from their inbox (check spam).
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
