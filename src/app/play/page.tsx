"use client"

import { Zap, Play, CircuitBoard, Lightbulb, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

export default function PlayPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [animateComponents, setAnimateComponents] = useState({
    heroTitle: false,
    heroSubtitle: false,
    circuitGrid: false,
    learnCard: false,
    buildCard: false,
    levelCards: false,
    statsSection: false,
    ctaSection: false,
  })

  const statsSectionRef = useRef(null)

  useEffect(() => {
    setIsLoaded(true)

    // Hero Section Animations
    setTimeout(() => setAnimateComponents((prev) => ({ ...prev, heroTitle: true })), 300) // increased from 200
    setTimeout(() => setAnimateComponents((prev) => ({ ...prev, heroSubtitle: true })), 800) // increased from 500
    setTimeout(() => setAnimateComponents((prev) => ({ ...prev, circuitGrid: true })), 1200) // increased from 800

    // Intersection Observer for Sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === "action-cards") {
              setAnimateComponents((prev) => ({ ...prev, learnCard: true, buildCard: true }))
            } else if (entry.target.id === "level-cards") {
              setAnimateComponents((prev) => ({ ...prev, levelCards: true }))
            } else if (entry.target.id === "stats-section") {
              setAnimateComponents((prev) => ({ ...prev, statsSection: true }))
            } else if (entry.target.id === "cta-section") {
              setAnimateComponents((prev) => ({ ...prev, ctaSection: true }))
            }
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.2,
      },
    )

    const actionCardsSection = document.getElementById("action-cards")
    const levelCardsSection = document.getElementById("level-cards")
    const statsSection = document.getElementById("stats-section")
    const ctaSection = document.getElementById("cta-section")

    if (actionCardsSection) observer.observe(actionCardsSection)
    if (levelCardsSection) observer.observe(levelCardsSection)
    if (statsSection) observer.observe(statsSection)
    if (ctaSection) observer.observe(ctaSection)

    return () => {
      if (actionCardsSection) observer.unobserve(actionCardsSection)
      if (levelCardsSection) observer.unobserve(levelCardsSection)
      if (statsSection) observer.unobserve(statsSection)
      if (ctaSection) observer.unobserve(ctaSection)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-blue-100 to-orange-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b-4 border-[#2176FF]/20">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="bg-[#33A1FD]/10 hover:bg-[#33A1FD]/20 p-3 rounded-xl transition-all duration-300 group"
            >
              <ArrowLeft className="h-6 w-6 text-[#2176FF] group-hover:text-[#31393C] transition-colors" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-[#2176FF] to-[#33A1FD] p-3 rounded-xl shadow-lg">
                <CircuitBoard className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-black text-[#31393C] tracking-tight">CirKit Kids</span>
            </div>
          </div>
          <Link href="/kidscircuit">
            <button className="bg-gradient-to-r from-[#F79824] to-[#FDCA40] hover:from-[#FDCA40] hover:to-[#F79824] text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/30">
              🎮 Build Circuits!
            </button>
          </Link>
        </div>
      </header>

      {/* Bright and Fun Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center bg-gradient-to-br from-yellow-100 via-white to-blue-50 rounded-3xl mx-6 my-8 shadow-xl">
        <div className="max-w-5xl mx-auto">
          <h1
            className={`text-5xl md:text-7xl font-black mb-8 text-gray-900 tracking-tight leading-tight drop-shadow-lg transition-all duration-1000 ${animateComponents.heroTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            Build Cool Circuits!
          </h1>
          <p
            className={`text-2xl md:text-3xl text-gray-800 mb-16 font-bold transition-all duration-1000 ${animateComponents.heroSubtitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            Learn electronics by playing! 🔌⚡
          </p>

          {/* Bright Visual Circuit Demo */}
          <div className="bg-white rounded-3xl p-12 shadow-2xl mb-16 border-4 border-[#2176FF]/30 relative overflow-hidden">
            {/* Bright colorful background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#33A1FD]/10 via-[#FDCA40]/10 to-[#F79824]/10 rounded-3xl"></div>

            <div className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto mb-8">
                {/* Bright colorful components */}
                <div
                  className={`bg-gradient-to-br from-[#2176FF] to-[#33A1FD] rounded-2xl h-24 w-24 md:h-28 md:w-28 flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 cursor-pointer border-4 border-white ${animateComponents.circuitGrid ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                  style={{ animationDelay: "0.3s" }}
                >
                  <Lightbulb className="h-12 w-12 md:h-14 md:w-14 text-white drop-shadow-lg" />
                </div>
                <div
                  className={`bg-gradient-to-br from-[#33A1FD] to-[#2176FF] rounded-3xl h-24 w-24 md:h-28 md:w-28 flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 cursor-pointer border-4 border-white ${animateComponents.circuitGrid ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                  style={{ animationDelay: "0.6s" }}
                >
                  <div className="bg-white rounded-full h-8 w-8 shadow-lg"></div>
                </div>
                <div
                  className={`bg-gradient-to-br from-[#FDCA40] to-[#F79824] rounded-3xl h-24 w-24 md:h-28 md:w-28 flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 cursor-pointer border-4 border-white ${animateComponents.circuitGrid ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                  style={{ animationDelay: "0.9s" }}
                >
                  <div className="bg-white rounded-full h-8 w-8 shadow-lg"></div>
                </div>
                <div
                  className={`bg-gradient-to-br from-[#F79824] to-[#FDCA40] rounded-2xl h-24 w-24 md:h-28 md:w-28 flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 cursor-pointer border-4 border-white ${animateComponents.circuitGrid ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                  style={{ animationDelay: "1.2s" }}
                >
                  <Zap className="h-12 w-12 md:h-14 md:w-14 text-white drop-shadow-lg" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#2176FF] bg-[#2176FF]/10 rounded-2xl py-4 px-8 inline-block border-2 border-[#2176FF]/30">
                Drag & Drop to Build!
              </p>
            </div>
          </div>

          {/* Bright Action Cards */}
          <div id="action-cards" className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Learn Card - Bright Blue Theme */}
            <Link href="/kidscircuit">
              <div
                className={`bg-white rounded-3xl p-8 shadow-2xl border-4 border-[#2176FF]/30 hover:border-[#2176FF]/50 transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer group relative overflow-hidden ${animateComponents.learnCard ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#33A1FD]/10 to-[#2176FF]/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-[#33A1FD]/20 to-[#2176FF]/20 rounded-2xl p-8 mb-6 border-2 border-[#2176FF]/20">
                    <div className="text-6xl mb-4">🎓</div>
                    <div className="text-4xl font-black text-[#2176FF] mb-2">Learn</div>
                  </div>
                  <div className="flex items-center justify-between bg-gradient-to-r from-[#2176FF] to-[#33A1FD] rounded-2xl p-4 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/30 p-2 rounded-lg backdrop-blur-sm">
                        <Play className="h-6 w-6" />
                      </div>
                      <span className="text-xl font-bold">Start Lessons</span>
                    </div>
                    <div className="text-2xl transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Build Card - Bright Orange Theme */}
            <Link href="/kidscircuit">
              <div
                className={`bg-white rounded-3xl p-8 shadow-2xl border-4 border-[#F79824]/30 hover:border-[#F79824]/50 transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer group relative overflow-hidden ${animateComponents.buildCard ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FDCA40]/10 to-[#F79824]/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-[#FDCA40]/20 to-[#F79824]/20 rounded-2xl p-8 mb-6 border-2 border-[#F79824]/20">
                    <div className="text-6xl mb-4">🔧</div>
                    <div className="text-4xl font-black text-[#F79824] mb-2">Build</div>
                  </div>
                  <div className="flex items-center justify-between bg-gradient-to-r from-[#F79824] to-[#FDCA40] rounded-2xl p-4 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/30 p-2 rounded-lg backdrop-blur-sm">
                        <CircuitBoard className="h-6 w-6" />
                      </div>
                      <span className="text-xl font-bold">Free Play</span>
                    </div>
                    <div className="text-2xl transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Bright Levels Section */}
      <section id="level-cards" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 text-[#31393C] tracking-tight">Fun Levels! 🎮</h2>
            <p className="text-xl text-[#31393C]/80 font-semibold">Choose your adventure!</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Link href="/kidscircuit">
              <div
                className={`bg-gradient-to-br from-[#2176FF] to-[#33A1FD] rounded-3xl p-8 text-center text-white shadow-2xl transform hover:scale-110 hover:-rotate-2 transition-all duration-500 cursor-pointer border-4 border-white group ${animateComponents.levelCards ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                style={{ animationDelay: "0.2s" }}
              >
                <div className="text-5xl font-black mb-3 group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="text-lg font-bold bg-white/30 rounded-xl py-2 px-3 backdrop-blur-sm">💡 LED</div>
              </div>
            </Link>

            <Link href="/kidscircuit">
              <div
                className={`bg-gradient-to-br from-[#33A1FD] to-[#2176FF] rounded-3xl p-8 text-center text-white shadow-2xl transform hover:scale-110 hover:rotate-2 transition-all duration-500 cursor-pointer border-4 border-white group ${animateComponents.levelCards ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                style={{ animationDelay: "0.4s" }}
              >
                <div className="text-5xl font-black mb-3 group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="text-lg font-bold bg-white/30 rounded-xl py-2 px-3 backdrop-blur-sm">🔗 Series</div>
              </div>
            </Link>

            <Link href="/kidscircuit">
              <div
                className={`bg-gradient-to-br from-[#FDCA40] to-[#F79824] rounded-3xl p-8 text-center text-white shadow-2xl transform hover:scale-110 hover:-rotate-2 transition-all duration-500 cursor-pointer border-4 border-white group ${animateComponents.levelCards ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                style={{ animationDelay: "0.6s" }}
              >
                <div className="text-5xl font-black mb-3 group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="text-lg font-bold bg-white/30 rounded-xl py-2 px-3 backdrop-blur-sm">⚡ Parallel</div>
              </div>
            </Link>

            <Link href="/kidscircuit">
              <div
                className={`bg-gradient-to-br from-[#F79824] to-[#FDCA40] rounded-3xl p-8 text-center text-white shadow-2xl transform hover:scale-110 hover:rotate-2 transition-all duration-500 cursor-pointer border-4 border-white group ${animateComponents.levelCards ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                style={{ animationDelay: "0.8s" }}
              >
                <div className="text-5xl font-black mb-3 group-hover:scale-110 transition-transform duration-300">
                  4
                </div>
                <div className="text-lg font-bold bg-white/30 rounded-xl py-2 px-3 backdrop-blur-sm">🎛️ Switch</div>
              </div>
            </Link>
          </div>

          <div className="text-center mt-16">
            <Link href="/kidscircuit">
              <button className="bg-gradient-to-r from-[#2176FF] to-[#33A1FD] hover:from-[#33A1FD] hover:to-[#2176FF] text-white text-2xl px-12 py-6 rounded-3xl font-black shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-white group">
                <Star className="inline mr-3 h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
                See All Levels!
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bright and Colorful Stats Section */}
      <section
        id="stats-section"
        className={`py-20 bg-gradient-to-r from-[#33A1FD] via-[#2176FF] to-[#33A1FD] text-white relative overflow-hidden transition-all duration-1200 ${animateComponents.statsSection ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        ref={statsSectionRef}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-7xl font-black mb-6 filter drop-shadow-lg">😊</div>
              <div className="text-4xl font-black mb-2 bg-white/30 rounded-2xl py-3 px-6 backdrop-blur-sm inline-block border-2 border-white/30">
                10,000+
              </div>
              <div className="text-xl font-bold text-white">Happy Kids!</div>
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-7xl font-black mb-6 filter drop-shadow-lg">🎯</div>
              <div className="text-4xl font-black mb-2 bg-white/30 rounded-2xl py-3 px-6 backdrop-blur-sm inline-block border-2 border-white/30">
                50+
              </div>
              <div className="text-xl font-bold text-white">Fun Levels!</div>
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-7xl font-black mb-6 filter drop-shadow-lg">⭐</div>
              <div className="text-4xl font-black mb-2 bg-white/30 rounded-2xl py-3 px-6 backdrop-blur-sm inline-block border-2 border-white/30">
                Super
              </div>
              <div className="text-xl font-bold text-white">Easy & Fun!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bright and Cheerful Final CTA */}
      <section
        id="cta-section"
        className={`py-24 bg-gradient-to-br from-yellow-200 via-pink-100 to-blue-200 relative overflow-hidden transition-all duration-1200 ${animateComponents.ctaSection ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=40 height=40 viewBox=0 0 40 40 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=%23F79824 fillOpacity=0.1%3E%3Cpath d=M20 20c0-11.046-8.954-20-20-20v20h20z/%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-12 text-gray-900 tracking-tight leading-tight drop-shadow-lg">
            Ready to Build? 🚀
          </h2>
          <Link href="/kidscircuit">
            <button className="bg-gradient-to-r from-[#2176FF] via-[#33A1FD] to-[#2176FF] hover:from-[#33A1FD] hover:via-[#2176FF] hover:to-[#33A1FD] text-white text-3xl px-20 py-10 rounded-3xl font-black shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative z-10 flex items-center justify-center">
                <Play className="inline mr-4 h-12 w-12 group-hover:scale-110 transition-transform duration-300" />
                START NOW!
              </div>
            </button>
          </Link>
        </div>
      </section>

      {/* Bright Footer */}
      <footer className="bg-white border-t-4 border-[#2176FF]/20 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-[#2176FF] to-[#33A1FD] p-4 rounded-xl shadow-lg">
              <CircuitBoard className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-[#31393C]">CirKit Kids</span>
          </div>
          <div className="text-[#31393C]/80 text-xl font-semibold bg-[#FDCA40]/20 rounded-2xl py-3 px-8 inline-block border-2 border-[#FDCA40]/30">
            Making electronics super fun! 🎉
          </div>
        </div>
      </footer>
    </div>
  )
}

// Enhanced Animation Styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-200px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInRight {
    from { transform: translateX(200px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes bounceIn {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-30px); }
    60% { transform: translateY(-15px); }
  }

  @keyframes scaleIn {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes countUp {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .slideInUp {
    animation: slideInUp 0.7s ease-out forwards;
  }

  .slideInLeft {
    animation: slideInLeft 0.7s ease-out forwards;
  }

  .slideInRight {
    animation: slideInRight 0.7s ease-out forwards;
  }

  .bounceIn {
    animation: bounceIn 1s ease-out forwards;
  }

  .scaleIn {
    animation: scaleIn 0.7s ease-out forwards;
  }

  .countUp {
    animation: countUp 1s ease-out forwards;
  }
`

// Inject animation styles into the document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.type = "text/css"
  styleSheet.innerText = animationStyles
  document.head.appendChild(styleSheet)
}
