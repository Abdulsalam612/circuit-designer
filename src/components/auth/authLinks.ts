// Links into the sign-in and sign-up dialogs on the home page. `next` is where to go once
// signed in, so someone heading for a lesson lands on that lesson, not the home page.
// Pure (no React, no window), so tests/auth-links.test.ts can check it.

// Only paths on this site: "/learn/x" yes; "//evil.com", "/\evil.com" (browsers read both
// as another site) and "https://…" no
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/")) return null
  if (next.startsWith("//") || next.startsWith("/\\")) return null
  return next
}

function dialogHref(dialog: "login" | "signup", next?: string | null) {
  const path = safeNextPath(next)
  return path ? `/?${dialog}=1&next=${encodeURIComponent(path)}` : `/?${dialog}=1`
}

// For protected pages sending a signed-out visitor away ("Sign in to continue")
export const loginHref = (next?: string | null) => dialogHref("login", next)

// For "start" buttons shown to signed-out visitors: new people need an account first
export const signupHref = (next?: string | null) => dialogHref("signup", next)
