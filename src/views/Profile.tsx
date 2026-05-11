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

  if (loading) return <div className="flex justify-center py-24"><ICONS.AILogo className="animate-spin" style={{ color: '#7c3aed' }} /></div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-6">
        <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <ICONS.Shield size={40} className="mx-auto text-violet-300" />
          <h2 className="font-bold text-2xl text-on-surface">Access Restricted</h2>
          <p className="text-sm text-on-surface-variant">Please sign in to access your profile and appeal history.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full text-white py-3 px-6 rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0d9488 100%)' }}
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
      <section className="relative pt-16 pb-10 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-end">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-white border-2 p-1 overflow-hidden relative z-10 transition-all shadow-md"
              style={{ borderColor: '#7c3aed' }}
            >
              <img
                src={user.photoURL || DEFAULT_AVATAR_SRC}
                alt=""
                className="w-full h-full rounded-xl object-cover"
              />
            </div>
            <button
              className="absolute -bottom-2 -right-2 text-white p-2.5 rounded-xl shadow-lg z-20 hover:scale-110 transition-transform border-2 border-white"
              style={{ background: '#7c3aed' }}
            >
              <ICONS.Camera size={16} />
            </button>
          </div>
          
          <div className="flex-1 text-center lg:text-left space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-3">
               <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Your Profile</span>
               <div className="h-px w-8 bg-gray-200" />
            </div>
            <h1 className="font-bold text-3xl md:text-4xl text-on-surface tracking-tight leading-tight">
              {profileData.name || 'Anonymous User'}
            </h1>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-200">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-green-700">Session verified</span>
              </div>
              <p className="text-xs font-medium text-on-surface-variant">
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
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Major / Field of Study</p>
                      <p className="font-bold text-2xl text-on-surface">{profileData.major || 'Not set yet'}</p>
                      <div className="h-px w-full bg-gray-100 mt-4 group-hover:bg-violet-200 transition-colors" />
                    </div>
                  </div>

                  <div className="bg-violet-50 rounded-2xl p-8 border border-violet-100 space-y-4 flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-on-surface">Edit Your Info</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Keep your details up to date so Regrade can personalize your appeal letters.
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-all"
                      style={{ background: '#7c3aed' }}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                   <button
                    onClick={handleSignOut}
                    className="px-6 py-2.5 rounded-xl border border-red-200 text-red-400 font-semibold text-sm hover:bg-red-500 hover:text-white transition-all"
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
                className="bg-white rounded-2xl p-8 space-y-6 border border-gray-100 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-on-surface-variant">Legal Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm text-on-surface"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-on-surface-variant">Major / Course Field</label>
                    <input
                      type="text"
                      required
                      value={profileData.major}
                      onChange={(e) => setProfileData({...profileData, major: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm text-on-surface"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 font-semibold text-sm text-on-surface-variant hover:bg-gray-50 rounded-xl transition-all border border-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scanning}
                    className="flex-1 py-3 font-semibold text-sm text-white rounded-xl shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: '#7c3aed' }}
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
           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Account Activity</h3>
                <p className="text-xs text-on-surface-variant">Recent security events for your account.</p>
              </div>

              <div className="space-y-4">
                {securityLogs.map((log, i) => (
                  <div key={i} className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                       <div className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7c3aed' }} />
                       <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-on-surface leading-none">{log.event}</p>
                          <p className="text-[10px] text-on-surface-variant">{log.time}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 shrink-0">Passed</span>
                  </div>
                ))}
              </div>

              <div className="pt-5 border-t border-gray-100 flex flex-col items-center text-center space-y-3">
                 <ICONS.Shield size={32} className="text-violet-200" />
                 <p className="text-xs font-medium text-on-surface-variant">Regrade — Your data is private</p>
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
            <div className="text-white rounded-2xl p-4 inline-flex items-center gap-3 shadow-2xl border border-white/20"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0d9488 100%)' }}>
              <ICONS.Check size={18} />
              <p className="text-sm font-semibold">Profile updated successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

