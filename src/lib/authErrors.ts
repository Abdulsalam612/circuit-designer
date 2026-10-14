// Firebase Auth errors read like "Firebase: Error (auth/invalid-credential)." – turn the
// common ones into something a learner can act on.

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match. Please try again.",
  "auth/wrong-password": "That email and password don't match. Please try again.",
  "auth/user-not-found": "That email and password don't match. Please try again.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/missing-email": "Please enter your email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/email-already-in-use": "There's already an account with that email. Try signing in instead.",
  "auth/weak-password": "Please choose a password with at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Couldn't reach the server. Check your internet connection.",
  "auth/user-disabled": "This account has been disabled.",
}

export const friendlyAuthError = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  const code = (error as { code?: unknown })?.code
  if (typeof code === "string") return MESSAGES[code] ?? fallback
  // Our own validation errors (plain Error, no code) are already readable
  if (error instanceof Error && error.message) return error.message
  return fallback
}
