import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  loginWithGoogle,
  sendPasswordResetEmail,
  sendEmailVerification,
  auth
} from '../lib/firebase';
import { ICONS } from '../constants';

import Logo from '../components/Logo';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const authMessageFromError = (err: unknown) => {
    const anyErr = err as { code?: string; message?: string };
    const code = anyErr?.code || '';

    if (code === 'auth/invalid-email') return 'That email address is invalid. Double-check it and try again.';
    if (code === 'auth/missing-email') return 'Please enter your email address first.';
    if (code === 'auth/user-not-found')
      return 'No account exists for that email yet. Create an account first, or use a different email.';
    if (code === 'auth/wrong-password') return 'Incorrect password. Try again or use “Forgot password?”.';
    if (code === 'auth/too-many-requests')
      return 'Too many attempts. Wait a bit and try again, or reset your password.';
    if (code === 'auth/operation-not-allowed')
      return 'Firebase Auth isn’t enabled for this sign-in method yet. In Firebase Console → Authentication → Sign-in method, enable Email/Password (and/or Google).';
    if (code === 'auth/unauthorized-domain')
      return 'This hostname isn’t allowed for Firebase Auth yet. In Firebase Console → Authentication → Settings → Authorized domains, add your hostname (e.g. localhost or 127.0.0.1).';

    return anyErr?.message || 'An authentication error occurred.';
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      // Ignore if user closed the popup
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          'This exact URL isn’t allowed for sign-in yet. In Firebase → Authentication → Settings → Authorized domains, add your hostname (if you use http://127.0.0.1:3000, add 127.0.0.1 — it’s different from localhost). Or open the app at http://localhost:3000 instead.',
        );
        return;
      }
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (forgotPassword) {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          setError('Please enter your email address first.');
          return;
        }
        await sendPasswordResetEmail(auth, trimmedEmail);
        setNotice('Password reset email sent. Check your inbox (and spam).');
        setForgotPassword(false);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
        setNotice('Account created! Please check your email and verify your address before signing in.');
        setIsLogin(true);
        return;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(authMessageFromError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 paper-texture">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 shadow-[0_0_15px_rgba(0,35,111,0.2)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Logo size="xl" className="mb-4" />
          <h2 className="font-serif text-4xl sm:text-5xl text-primary/80 font-light tracking-tight mb-3">Sign in to Regrade</h2>
          <p className="text-on-surface-variant font-bold opacity-50 text-sm uppercase tracking-[0.6em]">Your personal grade appeal assistant</p>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <ICONS.Lock size={120} />
          </div>

          <AnimatePresence mode="wait">
            {notice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold leading-relaxed flex items-start gap-3"
              >
                <ICONS.CheckCircle2 size={16} className="shrink-0" />
                {notice}
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold leading-relaxed flex items-start gap-3"
              >
                <ICONS.AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60 mb-2 block">Email address</label>
                <div className="relative">
                  <ICONS.User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface/50 border border-primary/5 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-primary transition-all text-base font-sans"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>

              {!forgotPassword && (
                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60 block">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="min-h-[44px] flex items-center text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors px-1"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <ICONS.Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      required={!forgotPassword}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface/50 border border-primary/5 rounded-xl pl-12 pr-12 py-4 outline-none focus:ring-1 focus:ring-primary transition-all text-base font-sans"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold tracking-widest uppercase text-xs shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <ICONS.AILogo className="animate-spin" size={18} />
              ) : (
                forgotPassword ? "Send Reset Email" : (isLogin ? "Sign In" : "Create Account")
              )}
            </button>

            {!forgotPassword && (
              <div className="relative py-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-primary/5" />
                <span className="text-[10px] font-bold text-primary/20 uppercase tracking-tighter">or</span>
                <div className="h-px flex-1 bg-primary/5" />
              </div>
            )}

            {!forgotPassword && (
              <div className="flex flex-col gap-4">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full border border-primary/10 py-5 rounded-2xl font-serif text-sm italic tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                  <ICONS.Bank size={20} className="text-primary/60 group-hover:scale-110 transition-transform" />
                  Continue with Google
                </button>
              </div>
            )}
          </form>

          <div className="mt-10 text-center">
             <button 
               onClick={() => {
                 if (forgotPassword) setForgotPassword(false);
                 else setIsLogin(!isLogin);
               }}
               className="text-sm font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all"
             >
               {forgotPassword ? "Back to Sign In" : (isLogin ? "New here? Create an account" : "Already have an account? Sign in")}
             </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-primary/30">
          Your data is private and secure with Regrade
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
