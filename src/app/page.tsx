"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { auth, firestore } from "@/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

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
import { useToast } from "@/context/ToastContext"
import { friendlyAuthError } from "@/lib/authErrors"

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
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)

  // AuthContext for user state
  const { user, loading } = useAuth()
  const toast = useToast()
  const router = useRouter()
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null)

  // Protected pages send logged-out users here as /?login=1&next=/path
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("signup") === "1") setShowSignupModal(true)
    if (params.get("login") !== "1") return
    setShowLoginModal(true)
    const next = params.get("next")
    // Only allow same-site paths, never "//evil.com"
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      setRedirectAfterLogin(next)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      setShowLoginModal(false)
      toast.success("Signed in. Welcome back!")
      if (redirectAfterLogin) router.push(redirectAfterLogin)
    } catch (error: unknown) {
      toast.error(friendlyAuthError(error, "Sign in failed. Please try again."))
    }
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
    setSignupLoading(true)
    try {
      if (!auth || !firestore) {
        throw new Error("Firebase not initialized properly.")
      }
      if (!signupEmail || !signupPassword || !signupName) {
        throw new Error("Please fill all fields.")
      }
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      await updateProfile(userCredential.user, { displayName: signupName })
      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        name: signupName,
        email: signupEmail,
        createdAt: new Date(),
        level: 1,
        xp: 1,
        completedLessons: [],
        completedGuides: [],
        totalLessons: 12,
        currentStreak: 0,
        totalPoints: 0,
      })
      setSignupLoading(false)
      setSignupName("")
      setSignupEmail("")
      setSignupPassword("")
      setShowSignupModal(false)
      toast.success(`Account created. Welcome to CirKit, ${signupName}!`)
    } catch (error: unknown) {
      setSignupLoading(false)
      toast.error(friendlyAuthError(error, "Sign up failed. Please try again."))
    }
  }

  const closeAuthDialogs = () => {
    setShowLoginModal(false)
    setShowSignupModal(false)
    setShowResetModal(false)
    // Passwords start hidden again next time
    setShowPassword(false)
    setResetEmail("")
    setResetSuccess(false)
    setResetError("")
  }

  // Esc closes whichever dialog is open
  const dialogOpen = showLoginModal || showSignupModal || showResetModal
  useEffect(() => {
    if (!dialogOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setShowLoginModal(false)
      setShowSignupModal(false)
      setShowResetModal(false)
      setShowPassword(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [dialogOpen])

  const openLoginModal = () => {
    setShowSignupModal(false)
    setShowLoginModal(true)
  }

  const openSignupModal = () => {
    setShowLoginModal(false)
    setShowSignupModal(true)
  }

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader
        sectionLinks={[
          { href: "#how-it-works", label: "How it works" },
          { href: "#schools", label: "For schools" },
        ]}
        onSignIn={() => setShowLoginModal(true)}
        onSignUp={() => setShowSignupModal(true)}
      />

      {/* Sign in / create account / reset password. Only the look lives here; the handlers
          above do the work. */}
      {showLoginModal && (
        <AuthDialog id="login" title="Welcome back" subtitle="Sign in to pick up where you left off." onClose={closeAuthDialogs}>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">
            New to CirKit?{" "}
            <button onClick={openSignupModal} className="font-medium text-signal hover:underline">Create an account</button>
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
              <p className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2.5 text-sm text-danger" role="alert">{resetError}</p>
            )}
            <Button type="submit" className="w-full" disabled={resetLoading}>
              {resetLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send reset link"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                closeAuthDialogs()
                setShowLoginModal(true)
              }}
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
            <Course />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="relative w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-lift animate-pop-in sm:p-8"
        onClick={e => e.stopPropagation()}
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
