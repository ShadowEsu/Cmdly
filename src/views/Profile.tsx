import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DOMPurify from 'dompurify';
import { ICONS, DEFAULT_AVATAR_SRC } from '../constants';
import { auth, loginWithGoogle, signOut } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { userService, UserProfile } from '../services/userService';
import { scanContentForThreats } from '../lib/securityScanner';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [profileData, setProfileData] = useState<UserProfile>({
    name: '',
    email: '',
    major: '',
    pushNotificationsEnabled: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showSecurityToast, setShowSecurityToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [togglingNotifications, setTogglingNotifications] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const data = await userService.getProfile(u.uid);
          if (data) {
            setProfileData({
              name: data.name || u.displayName || '',
              email: data.email || u.email || '',
              major: data.major || '',
              pushNotificationsEnabled: data.pushNotificationsEnabled || false,
            });
          }
        } catch (err) {
          console.error("Failed to fetch profile:", err);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const sanitizeInput = (val: string) => DOMPurify.sanitize(val.trim());

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setScanning(true);
    setError(null);

    const fullContent = `${profileData.name} ${profileData.major}`;
    const scanResult = await scanContentForThreats(fullContent, 'profile');

    if (!scanResult.isSafe) {
      setError(scanResult.recommendation || "Your input contains content that can't be saved. Please review and try again.");
      setScanning(false);
      return;
    }

    const sanitized = {
      name: sanitizeInput(profileData.name),
      major: sanitizeInput(profileData.major),
      email: sanitizeInput(profileData.email),
    };

    try {
      // Update email in Firebase Auth if it changed
      if (sanitized.email !== user.email) {
        await userService.updateEmail(user.uid, sanitized.email);
      }

      // Update profile in Firestore
      await userService.syncProfile(user.uid, sanitized);
      setProfileData(prev => ({ ...prev, ...sanitized }));
      setIsEditing(false);
      setToastMessage('Settings saved successfully');
      setShowSecurityToast(true);
      setTimeout(() => setShowSecurityToast(false), 3000);
    } catch (err: any) {
      const errorMsg = err.message?.includes('email-already-in-use')
        ? 'This email is already in use'
        : err.message || 'Failed to save settings';
      setError(errorMsg);
      console.error("Settings save failed", err);
    } finally {
      setScanning(false);
    }
  };

  const handleTogglePushNotifications = async () => {
    if (!user) return;

    setTogglingNotifications(true);
    setError(null);

    try {
      const newState = !profileData.pushNotificationsEnabled;
      await userService.togglePushNotifications(user.uid, newState);
      setProfileData(prev => ({ ...prev, pushNotificationsEnabled: newState }));
      setToastMessage(newState ? 'Push notifications enabled' : 'Push notifications disabled');
      setShowSecurityToast(true);
      setTimeout(() => setShowSecurityToast(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update notification settings');
      console.error("Toggle notifications failed", err);
    } finally {
      setTogglingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeletingAccount(true);
    setError(null);

    try {
      await userService.deleteAccount(user.uid);
      // Account deleted, user will be signed out automatically
    } catch (err: any) {
      const errorMsg = err.message?.includes('requires-recent-login')
        ? 'For security, please sign in again before deleting your account'
        : err.message || 'Failed to delete account';
      setError(errorMsg);
      console.error("Account deletion failed", err);
      setShowDeleteConfirm(false);
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><ICONS.AILogo className="animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-6">
        <div className="glass-panel p-12 rounded-3xl space-y-6">
          <ICONS.Shield size={48} className="mx-auto text-primary opacity-20" />
          <h2 className="font-serif text-3xl text-primary">Access Restricted</h2>
          <p className="text-on-surface-variant font-medium">Please sign in to access your profile and appeal history.</p>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-3"
          >
             Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-24 pb-48 px-6 lg:px-12">
      {/* Profile/Settings Header */}
      <section className="relative pt-32 pb-24 border-b border-primary/10">
        <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-end">
          <div className="relative group">
            <div className="w-56 h-56 rounded-[3.5rem] bg-white border-2 border-primary/10 p-2 overflow-hidden relative z-10 transition-all duration-700 shadow-huge">
              <img
                src={user.photoURL || DEFAULT_AVATAR_SRC}
                alt=""
                className="w-full h-full rounded-[3rem] object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-150 opacity-20 -z-0"></div>
            <button 
              className="absolute -bottom-4 -right-4 bg-primary text-white p-5 rounded-3xl shadow-huge z-20 hover:scale-110 transition-transform border-4 border-surface"
            >
              <ICONS.Camera size={24} />
            </button>
          </div>
          
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-4">
               <span className="text-[12px] font-light uppercase tracking-[0.45em] text-primary/45">Your Profile</span>
               <div className="h-px w-12 bg-primary/10" />
            </div>
            <h1 className="font-serif text-6xl md:text-8xl font-light text-primary tracking-tight italic leading-none uppercase">
              {profileData.name || 'Anonymous User'}
            </h1>
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center gap-2 px-6 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[11px] font-light text-green-700 uppercase tracking-widest">Session verified</span>
              </div>
              <p className="text-[11px] font-light text-on-surface-variant/45 uppercase tracking-[0.32em]">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        {/* Left Column: Form/Info */}
        <div className="lg:col-span-12 xl:col-span-8">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-12">
                    <div className="group">
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30 mb-2">Major / Field of Study</p>
                      <p className="font-serif text-4xl font-light text-primary italic uppercase tracking-tight">{profileData.major || 'Not set yet'}</p>
                      <div className="h-px w-full bg-primary/5 mt-6 group-hover:bg-primary/20 transition-colors" />
                    </div>
                  </div>

                  <div className="glass-panel rounded-[3rem] p-12 bg-primary/[0.02] border border-primary/5 space-y-8 flex flex-col justify-center">
                    <h3 className="font-serif text-2xl font-light text-primary leading-tight">Edit Your Info</h3>
                    <p className="text-lg text-primary/50 font-serif italic leading-relaxed">
                      Keep your details up to date so Regrade can personalize your appeal letters.
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-5 rounded-2xl bg-primary text-white font-bold uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                <section className="space-y-6 border-t border-primary/5 pt-12">
                  <div className="space-y-4">
                    <h3 className="font-bold uppercase tracking-[0.3em] text-[10px] text-primary/60">Notifications</h3>
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-primary/10 bg-primary/[0.02]">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">Push Notifications</p>
                        <p className="text-xs text-primary/50 mt-1">Receive updates about your appeals</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTogglePushNotifications}
                        disabled={togglingNotifications}
                        role="switch"
                        aria-checked={profileData.pushNotificationsEnabled}
                        className={`relative h-8 w-14 shrink-0 rounded-full ring-1 ring-primary/20 transition disabled:opacity-50 ${
                          profileData.pushNotificationsEnabled ? 'bg-emerald-500/25' : 'bg-primary/10'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ring-1 ring-primary/20 transition ${
                            profileData.pushNotificationsEnabled ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col gap-4 border-t border-primary/5 pt-12">
                  <button
                    onClick={handleSignOut}
                    className="px-10 py-5 rounded-2xl border border-primary/20 text-primary font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-primary/5 transition-all"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-10 py-5 rounded-2xl border border-red-500/20 text-red-500/60 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-red-500/10 hover:text-red-500 transition-all"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="edit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleUpdate}
                className="glass-panel rounded-[4rem] p-16 space-y-12 border border-primary/10 bg-white shadow-huge"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Legal Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full bg-surface/50 border border-primary/10 rounded-[2rem] px-8 py-5 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 text-xl font-serif italic"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full bg-surface/50 border border-primary/10 rounded-[2rem] px-8 py-5 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 text-xl font-serif italic"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-4">Major / Course Field</label>
                    <input
                      type="text"
                      required
                      value={profileData.major}
                      onChange={(e) => setProfileData({...profileData, major: e.target.value})}
                      className="w-full bg-surface/50 border border-primary/10 rounded-[2rem] px-8 py-5 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 text-xl font-serif italic"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-start gap-3">
                    <ICONS.AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-6 pt-12 border-t border-primary/5">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-5 font-bold uppercase tracking-[0.3em] text-[10px] text-primary/40 hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={scanning}
                    className="flex-1 py-5 font-bold uppercase tracking-[0.3em] text-[10px] text-white bg-primary rounded-2xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {scanning ? <ICONS.RefreshCcw className="animate-spin" size={20} /> : null}
                    {scanning ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Security Logs */}
        <div className="lg:col-span-12 xl:col-span-4 lg:sticky lg:top-32 h-fit">
           <div className="glass-panel rounded-[3.5rem] p-12 border border-primary/10 bg-primary/5 space-y-12">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-[0.6em] text-primary/50">Account Activity</h3>
                <p className="text-xs font-serif italic text-primary/30 leading-snug">Recent security events for your account.</p>
              </div>

              <div className="space-y-8">
                {securityLogs.map((log, i) => (
                  <div key={i} className="flex justify-between items-start group">
                    <div className="flex gap-6">
                       <div className="mt-1 w-2 h-2 rounded-full bg-primary/40 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(0,35,111,0.2)]" />
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-primary/80 leading-none">{log.event}</p>
                          <p className="text-[10px] font-bold text-primary/20 uppercase tracking-tighter italic">{log.time}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-green-700/60 bg-green-500/5 px-4 py-1.5 rounded-full uppercase tracking-tighter border border-green-500/10">Passed</span>
                  </div>
                ))}
              </div>

              <div className="pt-12 border-t border-primary/10 flex flex-col items-center text-center space-y-6">
                 <ICONS.Shield size={48} className="text-primary/10" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/30">Regrade — Your data is private</p>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showSecurityToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-50 text-center"
          >
            <div className="bg-primary text-white rounded-2xl p-4 inline-flex items-center gap-3 shadow-2xl border border-white/20">
              <ICONS.Check size={20} />
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
            onClick={() => !deletingAccount && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-red-100 rounded-full p-3 shrink-0">
                    <ICONS.AlertTriangle size={24} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary mb-2">Delete Account?</h3>
                    <p className="text-sm text-primary/60">This action cannot be undone. All your appeals, documents, and account data will be permanently deleted.</p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-start gap-3">
                    <ICONS.AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deletingAccount}
                    className="flex-1 py-3 rounded-xl border border-primary/20 text-primary font-bold uppercase tracking-wider text-xs hover:bg-primary/5 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold uppercase tracking-wider text-xs hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deletingAccount ? (
                      <>
                        <ICONS.RefreshCcw size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

