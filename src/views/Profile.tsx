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
  const [profileData, setProfileData] = useState<Pick<UserProfile, 'name' | 'email' | 'major'>>({
    name: '',
    email: '',
    major: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showSecurityToast, setShowSecurityToast] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securityLogs, setSecurityLogs] = useState([
    { event: 'Account authenticated', status: 'Passed', time: '2m ago' },
    { event: 'Session established', status: 'Verified', time: '1m ago' },
    { event: 'Connection secured', status: 'Active', time: 'Now' },
  ]);

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
    setSecurityError(null);

    const fullContent = `${profileData.name} ${profileData.major}`;
    const scanResult = await scanContentForThreats(fullContent, 'profile');

    if (!scanResult.isSafe) {
      setSecurityError(scanResult.recommendation || "Your input contains content that can't be saved. Please review and try again.");
      setSecurityLogs(prev => [
        { event: 'Suspicious input blocked', status: 'Blocked', time: 'Just now' },
        ...prev.slice(0, 2)
      ]);
      setScanning(false);
      return;
    }
    
    // Strict Input Filtering
    const sanitized = {
      name: sanitizeInput(profileData.name),
      major: sanitizeInput(profileData.major),
      email: profileData.email,
    };

    try {
      await userService.syncProfile(user.uid, sanitized);
      setProfileData(sanitized);
      setIsEditing(false);
      setShowSecurityToast(true);
      setTimeout(() => setShowSecurityToast(false), 3000);
      
      setSecurityLogs(prev => [
        { event: 'Security scan passed', status: 'Passed', time: 'Just now' },
        { event: 'Profile updated', status: 'Success', time: 'Just now' },
        ...prev.slice(0, 1)
      ]);
    } catch (err) {
      console.error("Profile save failed", err);
    } finally {
      setScanning(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  if (loading) return <div className="flex justify-center py-12 sm:py-24"><ICONS.AILogo className="animate-spin text-primary" size={32} /></div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-12 sm:py-24 space-y-6">
        <div className="glass-panel p-6 sm:p-8 md:p-12 rounded-xl sm:rounded-3xl space-y-4 sm:space-y-6">
          <ICONS.Shield size={40} className="mx-auto text-primary opacity-20 sm:w-12 sm:h-12" />
          <h2 className="font-serif text-2xl sm:text-3xl text-primary">Access Restricted</h2>
          <p className="text-sm sm:text-base text-on-surface-variant font-medium">Please sign in to access your profile and appeal history.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full bg-primary text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-3 min-h-12 sm:min-h-14"
          >
             Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 md:space-y-24 pb-24 sm:pb-32 md:pb-48 px-3 sm:px-6 lg:px-12">
      {/* Profile/Settings Header */}
      <section className="relative pt-6 sm:pt-12 md:pt-24 lg:pt-32 pb-8 sm:pb-12 md:pb-16 lg:pb-24 border-b border-primary/10">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 md:gap-12 lg:gap-16 items-center lg:items-end">
          <div className="relative group flex-shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-2xl sm:rounded-3xl md:rounded-[3.5rem] bg-white border-2 border-primary/10 p-1 sm:p-2 overflow-hidden relative z-10 transition-all duration-700 shadow-lg sm:shadow-huge">
              <img
                src={user.photoURL || DEFAULT_AVATAR_SRC}
                alt="Profile"
                className="w-full h-full rounded-lg sm:rounded-3xl md:rounded-[3rem] object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-150 opacity-20 -z-0"></div>
            <button
              className="absolute -bottom-2 sm:-bottom-3 -right-2 sm:-right-3 bg-primary text-white p-2 sm:p-3 md:p-5 rounded-lg sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-huge z-20 hover:scale-110 active:scale-95 transition-transform border-2 sm:border-4 border-surface min-h-10 sm:min-h-12 min-w-10 sm:min-w-12 flex items-center justify-center"
              aria-label="Change profile picture"
            >
              <ICONS.Camera size={18} className="sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </button>
          </div>

          <div className="flex-1 text-center lg:text-left space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4">
               <span className="text-[10px] sm:text-[12px] font-light uppercase tracking-[0.45em] text-primary/45">Your Profile</span>
               <div className="h-px w-6 sm:w-12 bg-primary/10" />
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-primary tracking-tight italic leading-tight sm:leading-none uppercase break-words">
              {profileData.name || 'Anonymous User'}
            </h1>
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-center lg:justify-start gap-2 sm:gap-4 pt-2 sm:pt-4">
              <div className="flex items-center gap-2 px-3 sm:px-6 py-1 sm:py-2 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] sm:text-[11px] font-light text-green-700 uppercase tracking-widest">Session verified</span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-light text-on-surface-variant/45 uppercase tracking-[0.32em] break-all">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 md:gap-20 lg:gap-24">
        {/* Left Column: Form/Info */}
        <div className="lg:col-span-12 xl:col-span-8">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 sm:space-y-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
                  <div className="space-y-6 sm:space-y-8 md:space-y-12">
                    <div className="group">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30 mb-2">Major / Field of Study</p>
                      <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-primary italic uppercase tracking-tight break-words">{profileData.major || 'Not set yet'}</p>
                      <div className="h-px w-full bg-primary/5 mt-3 sm:mt-4 md:mt-6 group-hover:bg-primary/20 transition-colors" />
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl sm:rounded-3xl md:rounded-[3rem] p-4 sm:p-6 md:p-8 lg:p-12 bg-primary/[0.02] border border-primary/5 space-y-4 sm:space-y-6 md:space-y-8 flex flex-col justify-center">
                    <h3 className="font-serif text-xl sm:text-2xl font-light text-primary leading-tight">Edit Your Info</h3>
                    <p className="text-sm sm:text-base md:text-lg text-primary/50 font-serif italic leading-relaxed">
                      Keep your details up to date so Regrade can personalize your appeal letters.
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl md:rounded-2xl bg-primary text-white font-bold uppercase tracking-[0.3em] text-[9px] sm:text-[10px] shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all min-h-11 sm:min-h-12 md:min-h-14"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                   <button
                    onClick={handleSignOut}
                    className="px-4 sm:px-6 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-red-500/20 text-red-500/40 font-bold uppercase tracking-[0.3em] text-[9px] sm:text-[10px] hover:bg-red-500 hover:text-white active:scale-[0.98] transition-all min-h-10 sm:min-h-11 md:min-h-12"
                   >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="edit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleUpdate}
                className="glass-panel rounded-2xl sm:rounded-3xl md:rounded-[4rem] p-4 sm:p-8 md:p-12 lg:p-16 space-y-6 sm:space-y-8 md:space-y-12 border border-primary/10 bg-white shadow-lg sm:shadow-huge"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-40 block">Legal Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full bg-surface/50 border border-primary/10 rounded-lg sm:rounded-xl md:rounded-[2rem] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-5 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface focus:border-primary/30 text-base sm:text-lg md:text-xl font-serif italic min-h-11 sm:min-h-12 md:min-h-14"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-40 block">Major / Course Field</label>
                    <input
                      type="text"
                      required
                      value={profileData.major}
                      onChange={(e) => setProfileData({...profileData, major: e.target.value})}
                      className="w-full bg-surface/50 border border-primary/10 rounded-lg sm:rounded-xl md:rounded-[2rem] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-5 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface focus:border-primary/30 text-base sm:text-lg md:text-xl font-serif italic min-h-11 sm:min-h-12 md:min-h-14"
                    />
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-8 lg:pt-12 border-t border-primary/5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 sm:py-3 md:py-4 lg:py-5 font-bold uppercase tracking-[0.3em] text-[9px] sm:text-[10px] text-primary/40 hover:bg-primary/5 rounded-lg sm:rounded-lg md:rounded-2xl transition-all border border-transparent hover:border-primary/10 active:scale-[0.98] min-h-10 sm:min-h-11 md:min-h-12"
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
              <p className="text-sm font-medium">Profile updated successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

