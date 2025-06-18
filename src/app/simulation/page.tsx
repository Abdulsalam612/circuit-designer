"use client"

import { ArrowLeft, RotateCcw, Play, Pause, Settings, Save, Upload } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useState } from "react";
// Define the shape of a circuit component (duplicated from KonvaTestCanvas)
interface CircuitComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
}
import PropertiesPanel from "../../components/PropertiesPanel";

// Dynamically import Konva components with SSR disabled
const KonvaTestCanvas = dynamic(() => import("../../components/KonvaTestCanvas"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full">Loading canvas...</div>
})

const CircuitSidebar = dynamic(() => import("../../components/CircuitSidebar"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full">Loading sidebar...</div>
})

export default function SimulationPage() {
  const [selectedComponent, setSelectedComponent] = useState<CircuitComponent | null>(null);
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
        <CircuitSidebar />
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

              <div id="zoom-controls-container" className="flex items-center space-x-4">
                {/* Zoom controls will be injected here from KonvaTestCanvas */}
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

            {/* Canvas Content Area */}
            <div className="absolute inset-0 p-6">
              <KonvaTestCanvas onSelectedComponentChange={setSelectedComponent} />
            </div>
          </div>
        </div>
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
            <p className="text-sm text-gray-500 mt-1">Component settings and values</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <PropertiesPanel component={selectedComponent} />
          </div>
        </div>
      </div>
    </div>
  )
}