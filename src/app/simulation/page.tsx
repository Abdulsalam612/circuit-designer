"use client"

import { useState } from "react"
import { ArrowLeft, RotateCcw, Play, Pause, Settings, Save, Upload } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamically import Konva components with SSR disabled
const KonvaTestCanvas = dynamic(() => import("../../components/KonvaTestCanvas"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full">Loading canvas...</div>
})

export default function SimulationPage() {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)

  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to CirKit</span>
                </div>
              </Link>

              <div className="h-6 w-px bg-gray-300"></div>

              <h1 className="text-xl font-semibold text-gray-900">Circuit Simulator</h1>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Import</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Save className="h-4 w-4" />
                <span className="text-sm font-medium">Save</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <RotateCcw className="h-4 w-4" />
                <span className="text-sm font-medium">Clear</span>
              </button>

              <div className="h-6 w-px bg-gray-300"></div>

              <button
                onClick={toggleSimulation}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                  isSimulationRunning
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {isSimulationRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Run</span>
                  </>
                )}
              </button>

              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Component Library */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Components</h2>
            <p className="text-sm text-gray-500 mt-1">Drag components to the canvas</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {/* Component categories will go here */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Components</h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* Placeholder component slots */}
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                    >
                      <span className="text-xs text-gray-400">Component {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Components</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                    >
                      <span className="text-xs text-gray-400">Advanced {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isSimulationRunning ? "bg-green-500" : "bg-gray-400"}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {isSimulationRunning ? "Simulation Running" : "Simulation Stopped"}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">Zoom: 100%</div>
                <div className="flex items-center space-x-1">
                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                    Fit
                  </button>
                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 bg-white relative overflow-hidden">
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Canvas Content Area - This is where your circuit library will go */}
            <div className="absolute inset-0 p-6">
              {/* Konva Canvas Test */}
              <KonvaTestCanvas />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
            <p className="text-sm text-gray-500 mt-1">Component settings and values</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="text-center text-gray-400 mt-8">
              <div className="text-gray-300 mb-2">
                <Settings className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm">Select a component to view properties</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}