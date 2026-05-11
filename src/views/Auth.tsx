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
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          "This exact URL isn’t allowed for sign-in yet. In Firebase → Authentication → Settings → Authorized domains, add your hostname (if you use http://127.0.0.1:3000, add 127.0.0.1 — it’s different from localhost). Or open the app at http://localhost:3000 instead.",
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
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      {/* Gradient top accent */}
      <div className="fixed top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0d9488 100%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo + tagline */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#7c3aed' }}>
            regrade
          </h1>
          <p className="text-on-surface-variant text-sm font-medium">Your grade appeal assistant</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold leading-relaxed flex items-start gap-3"
              >
                <ICONS.AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="group">
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">Email address</label>
                <div className="relative">
                  <ICONS.User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-sm"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>

              {!forgotPassword && (
                <div className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant block">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-xs font-semibold text-violet-500 hover:text-violet-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <ICONS.Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                    <input
                      type="password"
                      required={!forgotPassword}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 px-6 rounded-xl font-semibold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0d9488 100%)' }}
            >
              {loading ? (
                <ICONS.AILogo className="animate-spin" size={18} />
              ) : (
                forgotPassword ? "Send Reset Email" : (isLogin ? "Sign In" : "Create Account")
              )}
            </button>

            {!forgotPassword && (
              <div className="relative py-3 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-xs font-medium text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
            )}

            {!forgotPassword && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border border-gray-200 py-3 rounded-xl font-semibold text-sm text-on-surface hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <ICONS.Bank size={18} className="text-gray-500" />
                Continue with Google
              </button>
            )}
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                if (forgotPassword) setForgotPassword(false);
                else setIsLogin(!isLogin);
              }}
              className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-all"
            >
              {forgotPassword ? "Back to Sign In" : (isLogin ? "New here? Create an account →" : "Already have an account? Sign in →")}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-gray-400">
          Your data is private and secure with Regrade
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
