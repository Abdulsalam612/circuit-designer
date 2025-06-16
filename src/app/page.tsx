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
  Zap,
  Play,
  CircuitBoard,
  Lightbulb,
  Star,
  Users,
  BookOpen,
  Target,
  ArrowRight,
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { signOut } from "firebase/auth"

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
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)

  // Animation states
  const [isLoaded, setIsLoaded] = useState(false)
  const [animateComponents, setAnimateComponents] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  // AuthContext for user state
  const { user, loading } = useAuth()

  // Initialize animations on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    const componentTimer = setTimeout(() => {
      setAnimateComponents(true)
    }, 800)

    return () => {
      clearTimeout(timer)
      clearTimeout(componentTimer)
    }
  }, [])

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    // Observe all sections
    const sections = document.querySelectorAll("[data-animate]")
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch {
      alert("Logout failed.")
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      setShowLoginModal(false)
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert("Login failed. Unknown error.")
      }
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
      if (error instanceof Error) {
        setResetError(error.message)
      } else {
        setResetError("Failed to send reset email.")
      }
    }
    setResetLoading(false)
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Signup handler called")
    console.log("auth:", auth, "firestore:", firestore)
    console.log("signupEmail:", signupEmail, "signupPassword:", signupPassword, "signupName:", signupName)
    setSignupLoading(true)
    try {
      if (!auth || !firestore) {
        throw new Error("Firebase not initialized properly.")
      }
      if (!signupEmail || !signupPassword || !signupName) {
        throw new Error("Please fill all fields.")
      }
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      console.log("User created:", userCredential)
      await updateProfile(userCredential.user, { displayName: signupName })
      console.log("Profile updated")
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
      console.log("User doc written to Firestore")
      setSignupLoading(false)
      setSignupSuccess(true)
      setSignupName("")
      setSignupEmail("")
      setSignupPassword("")
      setShowSignupModal(false)
      setSignupSuccess(false)
      setSignupPassword("")
      setShowSignupModal(false)
      setSignupSuccess(false)
    } catch (error: unknown) {
      setSignupLoading(false)
      console.error("Signup error:", error)
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert("Signup failed. Unknown error.")
      }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
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

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#2176FF] p-2.5 rounded-lg">
              <CircuitBoard className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#31393C]">CirKit</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-[#31393C] font-medium transition-colors">
              Features
            </Link>
            <Link href="#education" className="text-gray-600 hover:text-[#31393C] font-medium transition-colors">
              Education
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-[#31393C] font-medium transition-colors">
              About
            </Link>
            <div className="flex items-center space-x-4">
              {!loading && user ? (
                <>
                  <span className="text-[#31393C] font-medium">{user.displayName || user.email}</span>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-4 py-2 bg-[#2176FF] text-white rounded hover:bg-[#33A1FD] transition-colors"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Sign In
                  </button>
                  <button
                    className="px-4 py-2 bg-[#33A1FD] text-white rounded hover:bg-[#2176FF] transition-colors"
                    onClick={() => setShowSignupModal(true)}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
            <Link href="/play">
              <button className="bg-[#F79824] hover:bg-[#FDCA40] text-white px-6 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105">
                CirKit Kids
              </button>
            </Link>
          </nav>

          {/* Mobile menu button would go here */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-[#31393C]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
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

            {signupSuccess && (
              <div className="mb-4 text-green-600 font-semibold text-center">Signup successful! Redirecting...</div>
            )}

            <form
              onSubmit={handleSignup}
              className="space-y-4"
              style={signupSuccess || signupLoading ? { pointerEvents: "none", opacity: 0.6 } : {}}
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
                  <a href="#" className="font-medium text-[#2176FF] hover:text-[#33A1FD]">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-medium text-[#2176FF] hover:text-[#33A1FD]">
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

      {/* Animated Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#33A1FD]/10 to-[#FDCA40]/5 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2176FF]/3 rounded-full opacity-50"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FDCA40]/3 rounded-full opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#33A1FD]/3 rounded-full opacity-50"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div
                className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <div
                  className={`inline-flex items-center bg-[#2176FF]/10 text-[#2176FF] px-4 py-2 rounded-full text-sm font-medium mb-6 transition-all duration-700 delay-200 ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                >
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Interactive Circuit Simulation
                </div>

                <h1
                  className={`text-5xl lg:text-6xl font-bold text-[#31393C] mb-6 leading-tight transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  Learn Electronics Through
                  <span className="text-[#2176FF] relative">
                    {" "}
                    Interactive Circuits
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#2176FF] to-[#33A1FD] transform scale-x-0 animate-[scaleX_1s_ease-out_1.5s_forwards] origin-left"></div>
                  </span>
                </h1>

                <p
                  className={`text-xl text-gray-600 mb-8 leading-relaxed transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  Build, simulate, and understand electrical circuits with our advanced virtual breadboard. Perfect for
                  students, educators, and electronics enthusiasts.
                </p>

                {/* Animated CTAs */}
                <div
                  className={`flex flex-col items-center space-y-6 transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  <Link href="/dashboard">
                    <button className="bg-[#2176FF] hover:bg-[#33A1FD] text-white px-12 py-5 rounded-xl font-bold text-xl flex items-center justify-center transition-all duration-300 hover:scale-[1.02] shadow-2xl hover:shadow-[#2176FF]/20 group">
                      <BookOpen className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                      Getting Started
                    </button>
                  </Link>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/simulation">
                      <button className="bg-white border-2 border-[#33A1FD] text-[#33A1FD] hover:bg-[#33A1FD]/5 hover:border-[#2176FF] px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 hover:scale-[1.02] shadow-lg group">
                        <CircuitBoard className="mr-2 h-5 w-5 group-hover:rotate-3 transition-transform duration-300" />
                        Start Building Circuits
                      </button>
                    </Link>

                    <Link href="/play">
                      <button className="bg-white border-2 border-[#F79824] text-[#F79824] hover:bg-[#F79824]/5 hover:border-[#FDCA40] px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 hover:scale-[1.02] shadow-lg group">
                        <Play className="mr-2 h-5 w-5 group-hover:scale-105 transition-transform duration-300" />
                        CirKit Kids Mode
                      </button>
                    </Link>
                  </div>

                  <p className="text-sm text-gray-500 text-center max-w-md">
                    New to electronics? Start with our guided lessons. Ready to build? Jump straight into the simulator.
                  </p>
                </div>
              </div>

              {/* Animated Circuit Demo */}
              <div
                className={`relative transition-all duration-1000 delay-400 ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              >
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 relative overflow-hidden">
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2176FF]/5 via-transparent to-[#FDCA40]/5 animate-pulse"></div>

                  <div className="relative z-10">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {/* More subtle animated components */}
                      <div
                        className={`bg-[#2176FF] rounded-lg h-16 w-16 flex items-center justify-center shadow-md transition-all duration-700 hover:scale-105 hover:shadow-lg cursor-pointer ${animateComponents ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                        style={{ transitionDelay: "1000ms" }}
                      >
                        <Lightbulb className="h-8 w-8 text-white" />
                      </div>
                      <div
                        className={`bg-[#33A1FD] rounded-lg h-16 w-16 flex items-center justify-center shadow-md transition-all duration-700 hover:scale-105 hover:shadow-lg cursor-pointer ${animateComponents ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                        style={{ transitionDelay: "1100ms" }}
                      >
                        <div className="bg-white rounded-full h-4 w-4"></div>
                      </div>
                      <div
                        className={`bg-[#FDCA40] rounded-lg h-16 w-16 flex items-center justify-center shadow-md transition-all duration-700 hover:scale-105 hover:shadow-lg cursor-pointer ${animateComponents ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                        style={{ transitionDelay: "1200ms" }}
                      >
                        <div className="bg-white rounded-full h-4 w-4"></div>
                      </div>
                      <div
                        className={`bg-[#F79824] rounded-lg h-16 w-16 flex items-center justify-center shadow-md transition-all duration-700 hover:scale-105 hover:shadow-lg cursor-pointer ${animateComponents ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                        style={{ transitionDelay: "1300ms" }}
                      >
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <div className="h-32 bg-[#31393C]/5 rounded-lg flex items-center justify-center border-2 border-dashed border-[#2176FF]/30 relative overflow-hidden">
                      {/* Subtle static circuit lines */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-4 w-8 h-0.5 bg-[#2176FF]"></div>
                        <div className="absolute top-4 right-4 w-8 h-0.5 bg-[#33A1FD]"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-0.5 bg-[#FDCA40]"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-0.5 bg-[#F79824]"></div>
                      </div>
                      <span className="text-[#31393C] font-medium relative z-10">Virtual Breadboard</span>
                    </div>
                  </div>
                </div>

                {/* More subtle floating elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#2176FF]/10 rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#FDCA40]/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white" data-animate>
        <div className="container mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${visibleSections.has("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h2 className="text-4xl font-bold text-[#31393C] mb-4">Why Choose CirKit?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced simulation tools combined with intuitive design make learning electronics accessible to everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div
              className={`text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-[#2176FF]/30 transition-all duration-700 group ${visibleSections.has("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="bg-[#2176FF]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CircuitBoard className="h-8 w-8 text-[#2176FF] group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-[#31393C] mb-4">Real-time Simulation</h3>
              <p className="text-gray-600">
                See your circuits come to life with accurate electrical behavior and instant feedback
              </p>
            </div>

            <div
              className={`text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-[#FDCA40]/30 transition-all duration-700 group ${visibleSections.has("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="bg-[#FDCA40]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-[#F79824] group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-[#31393C] mb-4">For All Ages</h3>
              <p className="text-gray-600">
                From elementary students to advanced learners, with age-appropriate interfaces and content
              </p>
            </div>

            <div
              className={`text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-[#33A1FD]/30 transition-all duration-700 group ${visibleSections.has("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="bg-[#33A1FD]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-[#33A1FD] group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-[#31393C] mb-4">Guided Learning</h3>
              <p className="text-gray-600">
                Step-by-step tutorials and challenges that build understanding progressively
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-20 bg-[#31393C]/5" data-animate>
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-[#31393C] mb-6">Perfect for Education</h2>
                <p className="text-lg text-gray-600 mb-8">
                  CirKit provides educators with powerful tools to teach electrical engineering concepts through
                  hands-on simulation and interactive learning experiences.
                </p>

                <div className="space-y-6">
                  <div
                    className={`flex items-start space-x-4 transition-all duration-700 ${visibleSections.has("education") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                    style={{ transitionDelay: "200ms" }}
                  >
                    <div className="bg-[#2176FF]/10 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-[#2176FF]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#31393C] mb-1">Curriculum Aligned</h3>
                      <p className="text-gray-600">Lessons designed to meet educational standards</p>
                    </div>
                  </div>

                  <div
                    className={`flex items-start space-x-4 transition-all duration-700 ${visibleSections.has("education") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                    style={{ transitionDelay: "400ms" }}
                  >
                    <div className="bg-[#FDCA40]/10 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-[#F79824]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#31393C] mb-1">Classroom Ready</h3>
                      <p className="text-gray-600">Multi-user support and progress tracking</p>
                    </div>
                  </div>

                  <div
                    className={`flex items-start space-x-4 transition-all duration-700 ${visibleSections.has("education") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                    style={{ transitionDelay: "600ms" }}
                  >
                    <div className="bg-[#33A1FD]/10 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-[#33A1FD]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#31393C] mb-1">Engaging Content</h3>
                      <p className="text-gray-600">Gamified learning that keeps students motivated</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`bg-white rounded-2xl shadow-xl p-8 border border-gray-200 transition-all duration-1000 ${visibleSections.has("education") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              >
                <h3 className="text-2xl font-bold text-[#31393C] mb-6">Learning Paths</h3>
                <div className="space-y-4">
                  <div
                    className={`flex items-center justify-between p-4 bg-[#2176FF]/5 rounded-lg border border-[#2176FF]/20 transition-all duration-500 hover:scale-[1.02] ${visibleSections.has("education") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                    style={{ transitionDelay: "300ms" }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#2176FF] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <span className="font-medium text-[#31393C]">Basic Circuits</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#2176FF]" />
                  </div>

                  <div
                    className={`flex items-center justify-between p-4 bg-[#33A1FD]/5 rounded-lg border border-[#33A1FD]/20 transition-all duration-500 hover:scale-[1.02] ${visibleSections.has("education") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                    style={{ transitionDelay: "450ms" }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#33A1FD] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <span className="font-medium text-[#31393C]">Series & Parallel</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#33A1FD]" />
                  </div>

                  <div
                    className={`flex items-center justify-between p-4 bg-[#FDCA40]/5 rounded-lg border border-[#FDCA40]/30 transition-all duration-500 hover:scale-[1.02] ${visibleSections.has("education") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                    style={{ transitionDelay: "600ms" }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#FDCA40] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <span className="font-medium text-[#31393C]">Advanced Components</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#FDCA40]" />
                  </div>

                  <div
                    className={`flex items-center justify-between p-4 bg-[#F79824]/5 rounded-lg border border-[#F79824]/20 transition-all duration-500 hover:scale-[1.02] ${visibleSections.has("education") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                    style={{ transitionDelay: "750ms" }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#F79824] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <span className="font-medium text-[#31393C]">Digital Logic</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#F79824]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#31393C] text-white relative overflow-hidden" data-animate id="stats">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-2 h-2 bg-[#33A1FD] rounded-full animate-ping"></div>
          <div
            className="absolute top-20 right-20 w-1 h-1 bg-[#FDCA40] rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-[#2176FF] rounded-full animate-ping"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-10 right-10 w-2 h-2 bg-[#F79824] rounded-full animate-ping"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div
              className={`transition-all duration-700 ${visibleSections.has("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "100ms" }}
            >
              <div
                className={`text-4xl font-bold mb-2 text-[#33A1FD] ${visibleSections.has("stats") ? "animate-countUp" : ""}`}
              >
                50,000+
              </div>
              <div className="text-white/80">Active Users</div>
            </div>
            <div
              className={`transition-all duration-700 ${visibleSections.has("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "200ms" }}
            >
              <div
                className={`text-4xl font-bold mb-2 text-[#2176FF] ${visibleSections.has("stats") ? "animate-countUp" : ""}`}
              >
                1,000+
              </div>
              <div className="text-white/80">Schools</div>
            </div>
            <div
              className={`transition-all duration-700 ${visibleSections.has("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "300ms" }}
            >
              <div
                className={`text-4xl font-bold mb-2 text-[#FDCA40] ${visibleSections.has("stats") ? "animate-countUp" : ""}`}
              >
                100+
              </div>
              <div className="text-white/80">Circuit Lessons</div>
            </div>
            <div
              className={`transition-all duration-700 ${visibleSections.has("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "400ms" }}
            >
              <div
                className={`text-4xl font-bold mb-2 text-[#F79824] ${visibleSections.has("stats") ? "animate-countUp" : ""}`}
              >
                98%
              </div>
              <div className="text-white/80">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white relative overflow-hidden" data-animate id="cta">
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-20 left-10 w-16 h-16 border-2 border-[#2176FF]/20 rounded-lg transform rotate-12 transition-all duration-1000 ${visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          ></div>
          <div
            className={`absolute bottom-20 right-10 w-12 h-12 bg-[#FDCA40]/10 rounded-full transition-all duration-1000 ${visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "200ms" }}
          ></div>
          <div
            className={`absolute top-1/2 right-20 w-8 h-8 border-2 border-[#33A1FD]/20 rounded-full transition-all duration-1000 ${visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "400ms" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2
            className={`text-4xl font-bold text-[#31393C] mb-6 transition-all duration-1000 ${visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            Ready to Start Building?
          </h2>
          <p
            className={`text-xl text-gray-600 mb-8 max-w-2xl mx-auto transition-all duration-1000 ${visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "200ms" }}
          >
            Join thousands of learners already exploring the world of electronics with CirKit
          </p>

          <div
            className={`flex flex-col items-center space-y-6 transition-all duration-1000 ${visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "400ms" }}
          >
            <Link href="/dashboard">
              <button className="bg-[#2176FF] hover:bg-[#33A1FD] text-white px-12 py-5 rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-2xl group">
                <BookOpen className="inline mr-4 h-6 w-6 group-hover:animate-pulse" />
                Start Learning Now
              </button>
            </Link>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/simulation">
                <button className="bg-white border-2 border-[#33A1FD] text-[#33A1FD] hover:bg-[#33A1FD]/5 hover:border-[#2176FF] px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg group">
                  <CircuitBoard className="inline mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Try Simulator
                </button>
              </Link>

              <Link href="/play">
                <button className="bg-white border-2 border-[#F79824] text-[#F79824] hover:bg-[#F79824]/5 hover:border-[#FDCA40] px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg group">
                  <Play className="inline mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Try Kids Mode
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#31393C] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[#2176FF] p-2 rounded-lg">
                  <CircuitBoard className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">CirKit</span>
              </div>
              <p className="text-gray-400">Making electronics education accessible and engaging for everyone.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-[#33A1FD]">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Learning Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/simulation" className="hover:text-white transition-colors">
                    Circuit Builder
                  </Link>
                </li>
                <li>
                  <Link href="/play" className="hover:text-white transition-colors">
                    Kids Mode
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-[#FDCA40]">Education</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#education" className="hover:text-white transition-colors">
                    For Schools
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Curriculum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Resources
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-[#F79824]">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CirKit. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleX {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(33, 118, 255, 0.3); }
          50% { box-shadow: 0 0 20px rgba(33, 118, 255, 0.6); }
        }
        
        @keyframes countUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-countUp {
          animation: countUp 0.8s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
