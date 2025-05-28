import { Zap, Play, CircuitBoard, Lightbulb, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-xl">
              <CircuitBoard className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black text-gray-800">CircuitKids</span>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transform hover:scale-105 transition-all">
            🎮 Play Now!
          </button>
        </div>
      </header>

      {/* Hero Section - Much Simpler */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-gray-800">Build Cool Circuits!</h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-12 font-bold">Learn electronics by playing! 🔌⚡</p>

          {/* Big Visual Circuit Demo */}
          <div className="bg-white rounded-3xl p-12 shadow-2xl mb-12 border-4 border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {/* Big, colorful components */}
              <div className="bg-yellow-400 rounded-full h-20 w-20 md:h-24 md:w-24 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all cursor-pointer">
                <Lightbulb className="h-10 w-10 md:h-12 md:w-12 text-yellow-800" />
              </div>
              <div className="bg-red-500 rounded-2xl h-20 w-20 md:h-24 md:w-24 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all cursor-pointer">
                <div className="bg-red-700 rounded-full h-6 w-6"></div>
              </div>
              <div className="bg-green-500 rounded-2xl h-20 w-20 md:h-24 md:w-24 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all cursor-pointer">
                <div className="bg-green-700 rounded-full h-6 w-6"></div>
              </div>
              <div className="bg-blue-500 rounded-full h-20 w-20 md:h-24 md:w-24 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all cursor-pointer">
                <Zap className="h-10 w-10 md:h-12 md:w-12 text-blue-100" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-8">Drag & Drop to Build!</p>
          </div>

          {/* Two Big Action Cards - Like LEGO Interface */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Start Learning Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-green-300 hover:border-green-400 transform hover:scale-105 transition-all cursor-pointer">
              <div className="bg-green-100 rounded-2xl p-8 mb-6">
                <div className="text-6xl mb-4">🎓</div>
                <div className="text-4xl font-black text-green-600 mb-2">Learn</div>
              </div>
              <div className="flex items-center justify-between bg-green-500 rounded-2xl p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Play className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold">Start Lessons</span>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </div>

            {/* Free Play Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-blue-300 hover:border-blue-400 transform hover:scale-105 transition-all cursor-pointer">
              <div className="bg-blue-100 rounded-2xl p-8 mb-6">
                <div className="text-6xl mb-4">🔧</div>
                <div className="text-4xl font-black text-blue-600 mb-2">Build</div>
              </div>
              <div className="flex items-center justify-between bg-blue-500 rounded-2xl p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <CircuitBoard className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold">Free Play</span>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Levels Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-800">Fun Levels! 🎮</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 text-center text-white shadow-xl transform hover:scale-105 transition-all cursor-pointer">
              <div className="text-4xl font-black mb-2">1</div>
              <div className="text-xl font-bold">💡 LED</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl p-6 text-center text-white shadow-xl transform hover:scale-105 transition-all cursor-pointer">
              <div className="text-4xl font-black mb-2">2</div>
              <div className="text-xl font-bold">🔗 Series</div>
            </div>

            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-center text-white shadow-xl transform hover:scale-105 transition-all cursor-pointer">
              <div className="text-4xl font-black mb-2">3</div>
              <div className="text-xl font-bold">⚡ Parallel</div>
            </div>

            <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-3xl p-6 text-center text-white shadow-xl transform hover:scale-105 transition-all cursor-pointer">
              <div className="text-4xl font-black mb-2">4</div>
              <div className="text-xl font-bold">🎛️ Switch</div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-2xl px-12 py-6 rounded-3xl font-black shadow-xl transform hover:scale-105 transition-all">
              <Star className="inline mr-3 h-8 w-8" />
              See All Levels!
            </button>
          </div>
        </div>
      </section>

      {/* Big Stats - Simplified */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-6xl font-black mb-4">😊</div>
              <div className="text-3xl font-black">10,000+</div>
              <div className="text-xl font-bold">Happy Kids!</div>
            </div>
            <div>
              <div className="text-6xl font-black mb-4">🎯</div>
              <div className="text-3xl font-black">50+</div>
              <div className="text-xl font-bold">Fun Levels!</div>
            </div>
            <div>
              <div className="text-6xl font-black mb-4">⭐</div>
              <div className="text-3xl font-black">Super</div>
              <div className="text-xl font-bold">Easy & Fun!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Big CTA */}
      <section className="py-20 bg-yellow-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-gray-800">Ready to Build? 🚀</h2>
          <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-3xl px-16 py-8 rounded-3xl font-black shadow-2xl transform hover:scale-105 transition-all">
            <Play className="inline mr-4 h-10 w-10" />
            START NOW!
          </button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-xl">
              <CircuitBoard className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black">CircuitKids</span>
          </div>
          <div className="text-gray-400 text-lg">Making electronics super fun! 🎉</div>
        </div>
      </footer>
    </div>
  )
}
