import { doc, getDoc, setDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserPreferences {
  preferredTone?: 'formal' | 'assertive' | 'diplomatic';
  primaryPlatform?: string;
  schoolName?: string;
  notesForAdvocate?: string;
  updatedAt?: unknown;
}

const PREFS_PATH = (uid: string) => `users/${uid}/meta/preferences`;

export const memoryService = {
  async getPreferences(uid: string): Promise<UserPreferences | null> {
    const ref = doc(db, 'users', uid, 'meta', 'preferences');
    try {
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as UserPreferences) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, PREFS_PATH(uid));
      throw err;
    }
  },

  async savePreferences(uid: string, prefs: Omit<UserPreferences, 'updatedAt'>): Promise<void> {
    const ref = doc(db, 'users', uid, 'meta', 'preferences');
    try {
      await setDoc(ref, { ...prefs, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, PREFS_PATH(uid));
      throw err;
    }
  },

  async clearField(uid: string, field: keyof Omit<UserPreferences, 'updatedAt'>): Promise<void> {
    const ref = doc(db, 'users', uid, 'meta', 'preferences');
    try {
      await setDoc(ref, { [field]: deleteField(), updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, PREFS_PATH(uid));
      throw err;
    }
  },

  async deleteAll(uid: string): Promise<void> {
    const ref = doc(db, 'users', uid, 'meta', 'preferences');
    try {
      await setDoc(ref, { updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, PREFS_PATH(uid));
      throw err;
    }
  },
};
