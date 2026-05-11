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
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
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
    setLoading(true);

    try {
      if (forgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setError("Password reset email sent. Check your inbox.");
        setForgotPassword(false);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
        setError("Account created! Please check your email and verify your address before signing in.");
        setIsLogin(true);
        return;
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-3 sm:p-6 paper-texture safe-area">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 shadow-[0_0_15px_rgba(0,35,111,0.2)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Logo size="xl" className="mb-4 sm:mb-6" />
          <h2 className="font-serif text-3xl sm:text-5xl text-primary/80 font-light tracking-tight mb-2 sm:mb-4">Sign in to Regrade</h2>
          <p className="text-on-surface-variant font-bold opacity-50 text-xs sm:text-sm uppercase tracking-[0.6em]">Your personal grade appeal assistant</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <ICONS.Lock size={120} />
          </div>

          <AnimatePresence mode="wait">
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

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
            <div className="space-y-3 sm:space-y-4">
              <div className="group">
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary opacity-60 mb-2 block">Email address</label>
                <div className="relative">
                  <ICONS.User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors flex-shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface/50 border border-primary/5 rounded-lg sm:rounded-xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface transition-all text-sm font-sans min-h-11 sm:min-h-12"
                    placeholder="student@university.edu"
                    inputMode="email"
                  />
                </div>
              </div>

              {!forgotPassword && (
                <div className="group">
                  <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 mb-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary opacity-60 block">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors px-2 py-1.5 rounded active:scale-95 min-h-10 justify-start"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <ICONS.Lock size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors flex-shrink-0" />
                    <input
                      type="password"
                      required={!forgotPassword}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface/50 border border-primary/5 rounded-lg sm:rounded-xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface transition-all text-sm font-sans min-h-11 sm:min-h-12"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold tracking-widest uppercase text-xs shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 min-h-12 sm:min-h-14"
            >
              {loading ? (
                <ICONS.AILogo className="animate-spin" size={18} />
              ) : (
                forgotPassword ? "Send Reset Email" : (isLogin ? "Sign In" : "Create Account")
              )}
            </button>

            {!forgotPassword && (
              <div className="relative py-3 sm:py-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-primary/5" />
                <span className="text-[10px] font-bold text-primary/20 uppercase tracking-tighter">or</span>
                <div className="h-px flex-1 bg-primary/5" />
              </div>
            )}

            {!forgotPassword && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full border border-primary/10 py-3 sm:py-4 rounded-lg sm:rounded-2xl font-serif text-sm italic tracking-widest hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-4 group disabled:opacity-50 min-h-12 sm:min-h-14"
                >
                  <ICONS.Bank size={20} className="text-primary/60 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="hidden sm:inline">Continue with Google</span>
                  <span className="sm:hidden">Google</span>
                </button>
              </div>
            )}
          </form>

          <div className="mt-6 sm:mt-8 md:mt-10 text-center">
             <button
               onClick={() => {
                 if (forgotPassword) setForgotPassword(false);
                 else setIsLogin(!isLogin);
               }}
               className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all px-2 py-2 rounded active:scale-95 min-h-10"
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
