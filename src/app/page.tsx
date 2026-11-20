"use client"

import type React from "react"
import { Suspense, useCallback, useEffect, useState } from "react"

import { auth, firestore } from "@/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  type UserCredential,
} from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"

import {
  CircuitBoard,
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import WelcomeBack from "@/components/WelcomeBack"
import SiteHeader from "@/components/SiteHeader"
import Button from "@/components/ui/Button"
import Field, { inputClass } from "@/components/ui/Field"
import { MIN_PASSWORD_LENGTH } from "@/lib/account"
import SiteFooter from "@/components/SiteFooter"
import { Course, FinalCallToAction, ForSchools, Hero, HowItWorks } from "@/components/landing/LandingSections"
import AuthQueryWatcher, { type AuthRequest } from "@/components/auth/AuthQueryWatcher"
import { useToast } from "@/context/ToastContext"
import { friendlyAuthError } from "@/lib/authErrors"
import { reportError } from "@/lib/reportError"

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState("")

  // AuthContext for user state
  const { user, loading } = useAuth()
  const toast = useToast()
  const router = useRouter()
  // Where to go once signed in or signed up (a "Start" button or a protected page set it)
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null)

  // /?login=1&next=/path (protected pages) and /?signup=1&next=/path ("Start" buttons).
  // The query is cleared once read, so the same link works again after closing the dialog.
  const handleAuthRequest = ({ dialog, next }: AuthRequest) => {
    setShowResetModal(false)
    setShowLoginModal(dialog === "login")
    setShowSignupModal(dialog === "signup")
    setLoginError("")
    setSignupError("")
    setRedirectAfterLogin(next)
    router.replace("/", { scroll: false })
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError("")
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      setShowLoginModal(false)
      setLoginEmail("")
      setLoginPassword("")
      setShowPassword(false)
      toast.success("Signed in. Welcome back!")
      if (redirectAfterLogin) router.push(redirectAfterLogin)
      setRedirectAfterLogin(null)
    } catch (error: unknown) {
      // Shown in the dialog, next to what needs fixing (a wrong password isn't a bug to report)
      setLoginError(friendlyAuthError(error, "Sign in failed. Please try again."))
    }
    setLoginLoading(false)
  }

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResetLoading(true)
    setResetSuccess(false)
    setResetError("")
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setResetSuccess(true)
      setResetEmail("")
    } catch (error: unknown) {
      setResetError(friendlyAuthError(error, "Failed to send reset email."))
    }
    setResetLoading(false)
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSignupError("")
    const name = signupName.trim()
    if (!name || !signupEmail || !signupPassword) {
      setSignupError("Please fill in every field.")
      return
    }
    setSignupLoading(true)
    let credential: UserCredential
    try {
      credential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
    } catch (error: unknown) {
      setSignupLoading(false)
      setSignupError(friendlyAuthError(error, "Sign up failed. Please try again."))
      return
    }

    // The account exists now, so nothing below may say "sign up failed" (trying again would
    // only hit "email already in use"). If these fail, the header falls back to the email,
    // and the name can be set again on the profile page.
    try {
      await updateProfile(credential.user, { displayName: name })
    } catch (error: unknown) {
      reportError(error, "Sign up: set display name")
    }
    // Just the name and email: progress starts empty (EMPTY_PROGRESS in lib/progress.ts)
    // and lessons add their fields as they're completed
    try {
      await setDoc(doc(firestore, "users", credential.user.uid), {
        name,
        email: signupEmail,
        createdAt: serverTimestamp(),
      }, { merge: true })
    } catch (error: unknown) {
      reportError(error, "Sign up: create profile")
    }

    setSignupLoading(false)
    setSignupName("")
    setSignupEmail("")
    setSignupPassword("")
    setShowPassword(false)
    setShowSignupModal(false)
    toast.success(`Account created. Welcome to CirKit, ${name}!`)
    if (redirectAfterLogin) router.push(redirectAfterLogin)
    setRedirectAfterLogin(null)
  }

  // X and Esc both close and start the dialogs afresh next time. The backdrop doesn't
  // close them, so a stray click can't throw away what's been typed.
  const closeAuthDialogs = useCallback(() => {
    setShowLoginModal(false)
    setShowSignupModal(false)
    setShowResetModal(false)
    // Passwords start hidden again next time
    setShowPassword(false)
    setLoginEmail("")
    setLoginPassword("")
    setLoginError("")
    setSignupName("")
    setSignupEmail("")
    setSignupPassword("")
    setSignupError("")
    setResetEmail("")
    setResetSuccess(false)
    setResetError("")
    // Closing means they're not heading there after all
    setRedirectAfterLogin(null)
  }, [])

  // Esc closes whichever dialog is open
  const dialogOpen = showLoginModal || showSignupModal || showResetModal
  useEffect(() => {
    if (!dialogOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthDialogs()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [dialogOpen, closeAuthDialogs])

  // Switching between sign in and sign up keeps the destination but not old errors
  const openLoginModal = () => {
    setShowSignupModal(false)
    setShowResetModal(false)
    setSignupError("")
    setResetSuccess(false)
    setResetError("")
    setShowLoginModal(true)
  }

  const openSignupModal = () => {
    setShowLoginModal(false)
    setShowResetModal(false)
    setLoginError("")
    setShowSignupModal(true)
  }

  // A protected page (or a "Start" button) sent them here
  const continuing = redirectAfterLogin !== null

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader
        sectionLinks={[
          { href: "#how-it-works", label: "How it works" },
          { href: "#schools", label: "For schools" },
        ]}
        onSignIn={openLoginModal}
        onSignUp={openSignupModal}
      />

      {/* useSearchParams needs a Suspense boundary for static rendering */}
      <Suspense fallback={null}>
        <AuthQueryWatcher onRequest={handleAuthRequest} />
      </Suspense>

      {/* Sign in / create account / reset password. Only the look lives here; the handlers
          above do the work. */}
      {showLoginModal && (
        <AuthDialog
          id="login"
          title={continuing ? "Sign in to continue" : "Welcome back"}
          subtitle={continuing ? "You need an account for that page. New here? Making one is free." : "Sign in to pick up where you left off."}
          onClose={closeAuthDialogs}
        >
          <form onSubmit={handleLogin} className="space-y-4" aria-busy={loginLoading}>
            <Field label="Email" htmlFor="email">
              <IconInput icon={Mail} id="email" type="email" autoComplete="email" value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            </Field>
            <Field label="Password" htmlFor="password">
              <PasswordInput id="password" autoComplete="current-password" value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)} shown={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </Field>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-signal hover:underline"
                onClick={() => {
                  setShowLoginModal(false)
                  setShowResetModal(true)
                }}
              >
                Forgot your password?
              </button>
            </div>
            {loginError && <FormError>{loginError}</FormError>}
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">
            New to CirKit?{" "}
            <button onClick={openSignupModal} className="font-medium text-signal hover:underline">Create a free account</button>
          </p>
        </AuthDialog>
      )}

      {showSignupModal && (
        <AuthDialog id="signup" title="Create your account" subtitle="It's free, and it saves your circuits and progress." onClose={closeAuthDialogs}>
          <form onSubmit={handleSignup} className="space-y-4" aria-busy={signupLoading}>
            <Field label="Your name" htmlFor="name">
              <IconInput icon={User} id="name" type="text" autoComplete="name" value={signupName}
                onChange={(e) => setSignupName(e.target.value)} placeholder="Ada Lovelace" required autoFocus />
            </Field>
            <Field label="Email" htmlFor="signup-email">
              <IconInput icon={Mail} id="signup-email" type="email" autoComplete="email" value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" required />
            </Field>
            <Field label="Password" htmlFor="signup-password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
              <PasswordInput id="signup-password" autoComplete="new-password" value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)} shown={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </Field>
            <label htmlFor="terms" className="flex items-start gap-2.5 text-sm text-ink">
              <input id="terms" name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong accent-signal" />
              <span>
                I agree to the{" "}
                {/* New tab, so the half-filled signup form isn't lost */}
                <a href="/terms" target="_blank" rel="noopener" className="font-medium text-signal hover:underline">Terms of Use</a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" rel="noopener" className="font-medium text-signal hover:underline">Privacy Policy</a>
              </span>
            </label>
            {signupError && <FormError>{signupError}</FormError>}
            <Button type="submit" className="w-full" disabled={signupLoading}>
              {signupLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating your account…</> : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <button onClick={openLoginModal} className="font-medium text-signal hover:underline">Sign in</button>
          </p>
        </AuthDialog>
      )}

      {showResetModal && (
        <AuthDialog id="reset" title="Reset your password" subtitle="We'll email you a link to choose a new one." onClose={closeAuthDialogs}>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <Field label="Email" htmlFor="reset-email">
              <IconInput icon={Mail} id="reset-email" type="email" autoComplete="email" value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            </Field>
            {resetSuccess && (
              <p className="rounded-control border border-success/25 bg-success-tint px-3 py-2.5 text-sm text-success" role="status">
                Reset link sent. Check your inbox, and your spam folder too.
              </p>
            )}
            {resetError && (
              <FormError>{resetError}</FormError>
            )}
            <Button type="submit" className="w-full" disabled={resetLoading}>
              {resetLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send reset link"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={openLoginModal}
            >
              Back to sign in
            </Button>
          </form>
        </AuthDialog>
      )}

      {/* Signed in: pick up where you left off. Signed out: the landing page. Nothing while
          sign-in is still being checked, so neither flashes up by mistake. */}
      <main>
        {loading ? (
          <section className="bg-grid min-h-[560px] border-b border-line" />
        ) : user ? (
          <>
            <WelcomeBack user={user} />
            <Course signedIn />
            <ForSchools />
          </>
        ) : (
          <>
            <Hero />
            <HowItWorks />
            <Course />
            <ForSchools />
            <FinalCallToAction />
          </>
        )}
      </main>

      {/* Footer */}
      <SiteFooter />

    </div>
  )
}

// ---- Sign-in dialogs ----

function AuthDialog({ id, title, subtitle, onClose, children }: {
  id: string
  title: string
  subtitle: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    // No close on a backdrop click: one stray tap would lose a half-filled form (X or Esc close it)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="relative w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-lift animate-pop-in sm:p-8"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-control p-1.5 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-6">
          <span className="mb-4 inline-flex rounded-control bg-brand p-2">
            <CircuitBoard className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <h2 id={`${id}-title`} className="font-display text-2xl font-semibold tracking-[-0.015em] text-ink">{title}</h2>
          <p className="mt-1 text-ink-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

// An error inside a dialog. role="alert" so screen readers hear it straight away.
function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2.5 text-sm text-danger" role="alert">{children}</p>
  )
}

function IconInput({ icon: Icon, className = "", ...props }: React.ComponentProps<"input"> & { icon: typeof Mail }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
      <input {...props} className={`${inputClass} pl-10 ${className}`} />
    </div>
  )
}

function PasswordInput({ shown, onToggle, ...props }: React.ComponentProps<"input"> & { shown: boolean; onToggle: () => void }) {
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
      <input {...props} type={shown ? "text" : "password"} required placeholder="••••••••" className={`${inputClass} pl-10 pr-11`} />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-control p-1.5 text-ink-faint hover:text-ink"
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
      >
        {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}
