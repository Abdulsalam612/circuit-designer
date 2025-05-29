"use client"

import { Zap, Play, CircuitBoard, Lightbulb, Star, Users, BookOpen, Target, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
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
            <Link href="/play">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105">
                CirKit Kids
              </button>
            </Link>
          </nav>
        </div>
      </header>

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
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl">
                <BookOpen className="inline mr-4 h-6 w-6" />
                Start Learning Now
              </button>
            </Link>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/simulation">
                <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  <CircuitBoard className="inline mr-3 h-5 w-5" />
                  Try Simulator
                </button>
              </Link>

              <Link href="/play">
                <button className="bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
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
    </div>
  )
}
