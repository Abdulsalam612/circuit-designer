// Firebase Auth errors read like "Firebase: Error (auth/invalid-credential)." – turn the
// common ones into something a learner can act on.

const MESSAGES: Record<string, string> = {
  // Also what re-authentication returns for a wrong current password
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
  "auth/requires-recent-login": "For your security, please log out, sign in again and retry.",
  "auth/user-mismatch": "That password doesn't match this account.",
  "auth/invalid-new-email": "That doesn't look like a valid email address.",
  "auth/operation-not-allowed": "That change isn't allowed for this account. Please contact us.",
}

export const friendlyAuthError = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  const code = (error as { code?: unknown })?.code
  if (typeof code === "string") return MESSAGES[code] ?? fallback
  // Our own validation errors (plain Error, no code) are already readable
  if (error instanceof Error && error.message) return error.message
  return fallback
}

// For forms where the user is already signed in and types their current password
// (change email/password, delete account)
const ACCOUNT_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Your current password isn't right.",
  "auth/wrong-password": "Your current password isn't right.",
  "auth/email-already-in-use": "Another account already uses that email.",
}

export const friendlyAccountError = (error: unknown, fallback?: string): string => {
  const code = (error as { code?: unknown })?.code
  if (typeof code === "string" && ACCOUNT_MESSAGES[code]) return ACCOUNT_MESSAGES[code]
  return friendlyAuthError(error, fallback)
}
