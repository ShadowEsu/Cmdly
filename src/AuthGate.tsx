import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, firebaseReady } from './lib/firebase';
import Auth from './views/Auth';
import { ICONS } from './constants';
import { userService } from './services/userService';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 paper-texture">
        <div className="text-center space-y-4">
          <ICONS.AILogo className="animate-spin text-primary mx-auto" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">Verifying Identity Integrity...</p>
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
    return <Auth />;
  }

  return <>{children}</>;
};

export default AuthGate;
