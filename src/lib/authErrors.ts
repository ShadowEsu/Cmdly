/**
 * User-facing copy for Firebase Auth errors (verification, reset, sign-in).
 */
export function formatFirebaseAuthError(err: unknown): string {
  const anyErr = err as { code?: string; message?: string };
  const code = anyErr?.code || '';

  const map: Record<string, string> = {
    'auth/invalid-email': 'That email address is invalid. Double-check it and try again.',
    'auth/missing-email': 'Please enter your email address first.',
    'auth/user-not-found':
      'No account exists for that email yet. Create an account first, or use a different email.',
    'auth/wrong-password':
      'Incorrect email or password. Try again or use “Forgot password?”.',
    'auth/invalid-credential':
      'Incorrect email or password. Try again or use “Forgot password?”.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
    'auth/operation-not-allowed':
      'This sign-in method is not enabled yet. In Firebase Console → Authentication → Sign-in method, enable Email/Password and/or Google.',
    'auth/unauthorized-domain':
      'This site’s hostname is not allowed for sign-in. In Firebase Console → Authentication → Settings → Authorized domains, add the exact host you use (localhost, 127.0.0.1, and your production domain are separate entries).',
    'auth/unauthorized-continue-uri':
      'Email links cannot return to this address yet. In Firebase → Authentication → Settings → Authorized domains, add the same host you use in the browser (including the port for local dev, e.g. localhost).',
    'auth/invalid-continue-uri':
      'The return URL for email links is not allowed. Add this app’s origin under Authorized domains in Firebase Authentication settings.',
    'auth/invalid-action-code':
      'This verification link is invalid or was already used. Tap “Resend verification email” for a new link.',
    'auth/expired-action-code':
      'This link has expired. Tap “Resend verification email” to get a fresh one.',
    'auth/user-disabled': 'This account has been disabled. Contact support if you think this is a mistake.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  };

  if (code && map[code]) return map[code];
  return anyErr?.message || 'Something went wrong. Please try again.';
}
