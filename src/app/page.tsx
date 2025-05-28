import { Zap, Target, Trophy, Play, BookOpen, Lightbulb, CircuitBoard } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <CircuitBoard className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CircuitKids
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
              Features
            </Link>
            <Link href="#levels" className="text-gray-600 hover:text-purple-600 transition-colors">
              Levels
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
              About
            </Link>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all">
              Start Learning
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 px-4 py-2 rounded-full text-sm font-medium">
            🎓 Learn by Doing
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            Build Amazing Circuits & Learn Electronics!
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover the exciting world of electrical engineering through fun, interactive circuit simulations. Build
            real circuits on a virtual breadboard and level up your skills!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/play" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center">
              <Play className="mr-2 h-5 w-5" />
              Start Building Circuits
            </Link>
            <button className="border border-purple-300 text-purple-600 hover:bg-purple-50 text-lg px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 border border-purple-200">
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {/* Simulated breadboard components */}
              <div className="bg-yellow-400 rounded-full h-12 w-12 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-yellow-800" />
              </div>
              <div className="bg-red-400 rounded h-12 w-12 flex items-center justify-center">
                <div className="bg-red-600 rounded-full h-3 w-3"></div>
              </div>
              <div className="bg-green-400 rounded h-12 w-12 flex items-center justify-center">
                <div className="bg-green-600 rounded-full h-3 w-3"></div>
              </div>
              <div className="bg-blue-400 rounded h-12 w-12 flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-800" />
              </div>
              <div className="bg-gray-400 rounded h-12 w-12 flex items-center justify-center">
                <div className="bg-gray-600 h-2 w-8 rounded"></div>
              </div>
              <div className="bg-orange-400 rounded-full h-12 w-12 flex items-center justify-center">
                <div className="bg-orange-600 rounded-full h-4 w-4"></div>
              </div>
            </div>
            <p className="text-purple-600 font-medium mt-4">Virtual Breadboard Simulation</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Why Kids Love CircuitKids</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learning electronics has never been this fun and interactive!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-purple-200 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white rounded-lg p-6">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CircuitBoard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-purple-700 mb-2">Interactive Simulation</h3>
              <p className="text-gray-600">Build real circuits on a virtual breadboard with drag-and-drop components</p>
            </div>

            <div className="border border-pink-200 hover:shadow-lg transition-shadow bg-gradient-to-br from-pink-50 to-white rounded-lg p-6">
              <div className="bg-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-pink-700 mb-2">Gamified Learning</h3>
              <p className="text-gray-600">
                Complete challenges, earn points, and unlock new components as you progress
              </p>
            </div>

            <div className="border border-blue-200 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white rounded-lg p-6">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Step-by-Step Lessons</h3>
              <p className="text-gray-600">Learn fundamental concepts with guided tutorials and instant feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* Levels Preview Section */}
      <section id="levels" className="py-16">
        <div className="container mx-auto px-4">    
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Learning Levels</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Progress through exciting challenges from basic circuits to advanced projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-green-200 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-green-50 to-white rounded-lg p-6 text-center">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">Basic LED</h3>
              <p className="text-gray-600">Light up your first LED with a battery and resistor</p>
            </div>

            <div className="border border-yellow-200 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-yellow-50 to-white rounded-lg p-6 text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-yellow-700 mb-2">Series Circuit</h3>
              <p className="text-gray-600">Connect multiple LEDs in a series configuration</p>
            </div>

            <div className="border border-orange-200 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-orange-50 to-white rounded-lg p-6 text-center">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-orange-700 mb-2">Parallel Circuit</h3>
              <p className="text-gray-600">Build parallel circuits and see how current divides</p>
            </div>

            <div className="border border-red-200 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-red-50 to-white rounded-lg p-6 text-center">
              <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-semibold text-red-700 mb-2">Switch Control</h3>
              <p className="text-gray-600">Add switches to control your circuits interactively</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center mx-auto">
              <Trophy className="mr-2 h-4 w-4" />
              View All 20+ Levels
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-purple-100">Students Learning</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-purple-100">Circuit Challenges</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-purple-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Ready to Start Your Electronics Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students already building amazing circuits and learning electronics the fun way!
          </p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-12 py-4 rounded-lg font-medium transition-all flex items-center mx-auto">
            <Zap className="mr-2 h-5 w-5" />
            Start Building Now - Its Free!
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <CircuitBoard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">CircuitKids</span>
            </div>
            <div className="text-gray-400"> 2024 CircuitKids. Making electronics fun for everyone!</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
