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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import WelcomeBack from "@/components/WelcomeBack"
import SiteHeader from "@/components/SiteHeader"
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

  const openLoginModal = () => {
    setShowSignupModal(false)
    setShowLoginModal(true)
  }

  const openSignupModal = () => {
    setShowLoginModal(false)
    setShowSignupModal(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-pop-in">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setShowResetModal(false)
                setResetEmail("")
                setResetSuccess(false)
                setResetError("")
              }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-[#31393C] mb-4 text-center">Reset Password</h2>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-[#31393C] mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-[#2176FF] text-black"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {resetSuccess && <p className="text-green-600 text-sm">Password reset email sent! Check your inbox.</p>}
              {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
              <button
                type="submit"
                className="w-full bg-[#2176FF] text-white font-semibold py-2 rounded hover:bg-[#33A1FD] transition-colors"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send Reset Email"}
              </button>
              <button
                type="button"
                className="w-full mt-2 text-[#2176FF] hover:underline"
                onClick={() => {
                  setShowResetModal(false)
                  setShowLoginModal(true)
                }}
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}

      <SiteHeader
        sectionLinks={[
          { href: "#how-it-works", label: "How it works" },
          { href: "#schools", label: "For schools" },
        ]}
        onSignIn={() => setShowLoginModal(true)}
        onSignUp={() => setShowSignupModal(true)}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-pop-in">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-[#2176FF] p-2.5 rounded-lg inline-block mb-2">
                <CircuitBoard className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#31393C]">Welcome back</h2>
              <p className="text-gray-600 mt-1">Log in to continue your learning journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#31393C] mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2176FF] focus:border-[#2176FF] text-black"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#31393C] mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-[#2176FF] focus:border-[#2176FF] text-black"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#2176FF] focus:ring-[#2176FF] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#31393C]">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    className="font-medium text-[#2176FF] hover:text-[#33A1FD] bg-transparent border-0 p-0 m-0 cursor-pointer"
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowResetModal(true)
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2176FF] hover:bg-[#33A1FD] text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Log in
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <button onClick={openSignupModal} className="font-medium text-[#2176FF] hover:text-[#33A1FD]">
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-pop-in">
            <button
              onClick={() => setShowSignupModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-[#2176FF] p-2.5 rounded-lg inline-block mb-2">
                <CircuitBoard className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#31393C]">Create your account</h2>
              <p className="text-gray-600 mt-1">Start your electronics learning journey today</p>
            </div>

            <form
              onSubmit={handleSignup}
              className="space-y-4"
              style={signupLoading ? { pointerEvents: "none", opacity: 0.6 } : {}}
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#31393C] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2176FF] focus:border-[#2176FF] text-black"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-[#31393C] mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2176FF] focus:border-[#2176FF] text-black"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-[#31393C] mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-[#2176FF] focus:border-[#2176FF] text-black"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-[#2176FF] focus:ring-[#2176FF] border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-[#31393C]">
                  I agree to the{" "}
                  {/* New tab, so the half-filled signup form isn't lost */}
                  <a href="/terms" target="_blank" rel="noopener" className="font-medium text-[#2176FF] hover:text-[#33A1FD]">
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noopener" className="font-medium text-[#2176FF] hover:text-[#33A1FD]">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2176FF] hover:bg-[#33A1FD] text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Signing up...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button onClick={openLoginModal} className="font-medium text-[#2176FF] hover:text-[#33A1FD]">
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
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
