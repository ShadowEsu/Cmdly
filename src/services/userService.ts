import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth, deleteUser, updateEmail } from '../lib/firebase';

export interface UserProfile {
  name: string;
  email: string;
  /** Legacy field; no longer collected in the app. */
  studentId?: string;
  major: string;
  avatarUrl?: string;
  pushNotificationsEnabled?: boolean;
}

export const userService = {
  async syncProfile(uid: string, profile: Partial<UserProfile>) {
    const docRef = doc(db, 'users', uid);
    try {
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        const newProfile = {
          name: profile.name || 'Anonymous Student',
          email: profile.email || '',
          major: profile.major ?? 'Undeclared',
          avatarUrl: profile.avatarUrl || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(docRef, newProfile);
        return newProfile;
      } else {
        const updates: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
        };

        if (profile.name !== undefined) updates.name = profile.name;
        if (profile.email !== undefined) updates.email = profile.email;
        if (profile.major !== undefined) updates.major = profile.major;
        if (profile.avatarUrl !== undefined) updates.avatarUrl = profile.avatarUrl;

        await setDoc(docRef, updates, { merge: true });
        const existing = snapshot.data() as Record<string, unknown>;
        return { ...existing, ...updates };
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
      throw error;
    }
  },

  async getProfile(uid: string) {
    const docRef = doc(db, 'users', uid);
    try {
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() as UserProfile : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      throw error;
    }
  },

  async updateEmail(uid: string, newEmail: string) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Update Firebase Auth email
      await updateEmail(user, newEmail);

      // Update Firestore
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, {
        email: newEmail,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/email`);
      throw error;
    }
  },

  async togglePushNotifications(uid: string, enabled: boolean) {
    const docRef = doc(db, 'users', uid);
    try {
      await setDoc(docRef, {
        pushNotificationsEnabled: enabled,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return enabled;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/pushNotifications`);
      throw error;
    }
  },

  async deleteAccount(uid: string) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Delete all cases and associated data
      const casesRef = collection(db, 'cases');
      const q = query(casesRef, where('userId', '==', uid));
      const casesSnapshot = await getDocs(q);

      for (const caseDoc of casesSnapshot.docs) {
        // Delete milestones subcollection
        const milestonesRef = collection(caseDoc.ref, 'milestones');
        const milestonesSnapshot = await getDocs(milestonesRef);
        for (const milestone of milestonesSnapshot.docs) {
          await deleteDoc(milestone.ref);
        }
        // Delete case document
        await deleteDoc(caseDoc.ref);
      }

      // Delete user document
      const userDocRef = doc(db, 'users', uid);
      await deleteDoc(userDocRef);

      // Delete Firebase Auth user
      await deleteUser(user);

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
      throw error;
    }
  }
};
