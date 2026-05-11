import type { FirebaseOptions } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

function readEnv(name: keyof ImportMetaEnv): string | undefined {
  const v = import.meta.env[name];
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return trimmed ? trimmed : undefined;
}

function placeholder(name: string) {
  return `missing-${name.toLowerCase()}`;
}

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const satisfies ReadonlyArray<keyof ImportMetaEnv>;

const missingKeys = requiredEnvKeys.filter((k) => !readEnv(k));

/**
 * True when Firebase is configured from `.env`.
 * In dev, we allow the app to boot with placeholder values so the UI can load.
 */
export const firebaseReady = missingKeys.length === 0;
if (!firebaseReady) {
  console.warn(
    `[Regrade] Firebase web config is missing (${missingKeys.join(
      ', ',
    )}). The app will start in limited mode. Copy .env.example to .env and set your Firebase keys.`,
  );
}

const firebaseWeb: FirebaseOptions = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY') ?? placeholder('api-key'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN') ?? `${placeholder('auth')}.firebaseapp.com`,
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID') ?? placeholder('project-id'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET') ?? `${placeholder('bucket')}.appspot.com`,
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') ?? '0',
  appId: readEnv('VITE_FIREBASE_APP_ID') ?? placeholder('app-id'),
  measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID') || undefined,
};

const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID?.trim() || '(default)';

const app = initializeApp(firebaseWeb);
export const auth = getAuth(app);
export const db = getFirestore(app, firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

/**
 * MANDATORY ERROR HANDLER: Provides context for permission failures.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  const jsonError = JSON.stringify(errInfo);
  console.error('Firestore Error: ', jsonError);
  throw new Error(jsonError);
}

export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: unknown) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: string }).code : '';
    if (code !== 'auth/popup-closed-by-user') {
      console.error('Auth Error', error);
    }
    throw error;
  }
};
