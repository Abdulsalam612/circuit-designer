"use client"

import { auth, firestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { useState } from "react"
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
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // AuthContext for user state
  const { user, loading } = useAuth();

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      alert("Logout failed.");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLoginModal(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Login failed. Unknown error.");
      }
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Signup handler called");
    console.log("auth:", auth, "firestore:", firestore);
    console.log("signupEmail:", signupEmail, "signupPassword:", signupPassword, "signupName:", signupName);
    setSignupLoading(true);
    try {
      if (!auth || !firestore) {
        throw new Error("Firebase not initialized properly.");
      }
      if (!signupEmail || !signupPassword || !signupName) {
        throw new Error("Please fill all fields.");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      console.log("User created:", userCredential);
      await updateProfile(userCredential.user, { displayName: signupName });
      console.log("Profile updated");
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
        totalPoints: 0
      });
      console.log("User doc written to Firestore");
      setSignupLoading(false);
      setSignupSuccess(true);
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setShowSignupModal(false);
      setSignupSuccess(false);
setSignupPassword("");
setShowSignupModal(false);
setSignupSuccess(false);
    } catch (error: unknown) {
      setSignupLoading(false);
      console.error("Signup error:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Signup failed. Unknown error.");
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-lg">
              <CircuitBoard className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CirKit</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Features
            </Link>
            <Link href="#education" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Education
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              About
            </Link>
            <div className="flex items-center space-x-4">
              {!loading && user ? (
                <>
                  <span className="text-gray-700 font-medium">
                    {user.displayName || user.email}
                  </span>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Sign In
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    onClick={() => setShowSignupModal(true)}
                  >
                    Sign Up
                  </button>
                </>
              )}

            </div>
            <Link href="/play">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105">
                CirKit Kids
              </button>
            </Link>
          </nav>

          {/* Mobile menu button would go here */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
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
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-lg inline-block mb-2">
                <CircuitBoard className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-600 mt-1">Log in to continue your learning journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Log in
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <button onClick={openSignupModal} className="font-medium text-blue-600 hover:text-blue-500">
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
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-lg inline-block mb-2">
                <CircuitBoard className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="text-gray-600 mt-1">Start your electronics learning journey today</p>
            </div>

            {signupSuccess && (
              <div className="mb-4 text-green-600 font-semibold text-center">Signup successful! Redirecting...</div>
            )}

            <form onSubmit={handleSignup} className="space-y-4" style={signupSuccess || signupLoading ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Signing up...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button onClick={openLoginModal} className="font-medium text-blue-600 hover:text-blue-500">
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Zap className="h-4 w-4 mr-2" />
                  Interactive Circuit Simulation
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Learn Electronics Through
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Interactive Circuits
                  </span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Build, simulate, and understand electrical circuits with our advanced virtual breadboard. Perfect for
                  students, educators, and electronics enthusiasts.
                </p>

                {/* Main CTA - Getting Started (Big) */}
                <div className="flex flex-col items-center space-y-6">
                  <Link href="/dashboard">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-5 rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-2xl">
                      <BookOpen className="mr-4 h-6 w-6" />
                      Getting Started
                    </button>
                  </Link>

                  {/* Secondary CTAs (Smaller) */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/simulation">
                      <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg">
                        <CircuitBoard className="mr-2 h-5 w-5" />
                        Start Building Circuits
                      </button>
                    </Link>

                    <Link href="/play">
                      <button className="bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg">
                        <Play className="mr-2 h-5 w-5" />
                        CirKit Kids Mode
                      </button>
                    </Link>
                  </div>

                  <p className="text-sm text-gray-500 text-center max-w-md">
                    New to electronics? Start with our guided lessons. Ready to build? Jump straight into the simulator.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-yellow-400 rounded-lg h-16 w-16 flex items-center justify-center shadow-md">
                      <Lightbulb className="h-8 w-8 text-yellow-800" />
                    </div>
                    <div className="bg-red-500 rounded-lg h-16 w-16 flex items-center justify-center shadow-md">
                      <div className="bg-red-700 rounded-full h-4 w-4"></div>
                    </div>
                    <div className="bg-green-500 rounded-lg h-16 w-16 flex items-center justify-center shadow-md">
                      <div className="bg-green-700 rounded-full h-4 w-4"></div>
                    </div>
                    <div className="bg-blue-500 rounded-lg h-16 w-16 flex items-center justify-center shadow-md">
                      <Zap className="h-8 w-8 text-blue-100" />
                    </div>
                  </div>
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-gray-500 font-medium">Virtual Breadboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose CirKit?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced simulation tools combined with intuitive design make learning electronics accessible to everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CircuitBoard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Simulation</h3>
              <p className="text-gray-600">
                See your circuits come to life with accurate electrical behavior and instant feedback
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">For All Ages</h3>
              <p className="text-gray-600">
                From elementary students to advanced learners, with age-appropriate interfaces and content
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Guided Learning</h3>
              <p className="text-gray-600">
                Step-by-step tutorials and challenges that build understanding progressively
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Perfect for Education</h2>
                <p className="text-lg text-gray-600 mb-8">
                  CirKit provides educators with powerful tools to teach electrical engineering concepts through
                  hands-on simulation and interactive learning experiences.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Curriculum Aligned</h3>
                      <p className="text-gray-600">Lessons designed to meet educational standards</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Classroom Ready</h3>
                      <p className="text-gray-600">Multi-user support and progress tracking</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Engaging Content</h3>
                      <p className="text-gray-600">Gamified learning that keeps students motivated</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Learning Paths</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <span className="font-medium">Basic Circuits</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <span className="font-medium">Series & Parallel</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <span className="font-medium">Advanced Components</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <span className="font-medium">Digital Logic</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-blue-100">Schools</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Circuit Lessons</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Start Building?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners already exploring the world of electronics with CirKit
          </p>

          <div className="flex flex-col items-center space-y-6">
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-5 rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-2xl">
                <BookOpen className="inline mr-4 h-6 w-6" />
                Start Learning Now
              </button>
            </Link>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/simulation">
                <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg">
                  <CircuitBoard className="inline mr-3 h-5 w-5" />
                  Try Simulator
                </button>
              </Link>

              <Link href="/play">
                <button className="bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg">
                  <Play className="inline mr-3 h-5 w-5" />
                  Try Kids Mode
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <CircuitBoard className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">CirKit</span>
              </div>
              <p className="text-gray-400">Making electronics education accessible and engaging for everyone.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
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
              <h3 className="font-semibold mb-4">Education</h3>
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
              <h3 className="font-semibold mb-4">Support</h3>
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

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CirKit. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
