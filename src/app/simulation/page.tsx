"use client"

import { useState } from "react"
import { ArrowLeft, RotateCcw, Play, Pause, Zap } from "lucide-react"
import Link from "next/link"

type ComponentType = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

type PlacedComponent = {
  id: number;
  type: string;
  row: number;
  col: number;
  name: string;
  emoji: string;
  color: string;
};

export default function SimulationPage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);

  const components: ComponentType[] = [
    { id: "led", name: "LED", emoji: "💡", color: "bg-yellow-400" },
    { id: "resistor", name: "Resistor", emoji: "🔧", color: "bg-orange-400" },
    { id: "battery", name: "Battery", emoji: "🔋", color: "bg-green-400" },
    { id: "switch", name: "Switch", emoji: "🎛️", color: "bg-blue-400" },
    { id: "wire", name: "Wire", emoji: "➖", color: "bg-gray-400" },
  ]

  const handleGridClick = (row: number, col: number) => {
    if (selectedComponent) {
      const newComponent: PlacedComponent = {
        id: Date.now(),
        type: selectedComponent.id,
        row,
        col,
        name: selectedComponent.name,
        emoji: selectedComponent.emoji,
        color: selectedComponent.color,
      };
      setPlacedComponents([...placedComponents, newComponent]);
      setSelectedComponent(null);
    }
  }

  const clearGrid = () => {
    setPlacedComponents([]);
    setIsSimulationRunning(false);
  }

  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-purple-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/play" className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
            <ArrowLeft className="h-6 w-6 mr-2" />
            <span className="font-medium">Back to Play</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-800">Circuit Builder</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={clearGrid}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Clear</span>
          </button>
          <button
            onClick={toggleSimulation}
            className={`${
              isSimulationRunning ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"
            } text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all`}
          >
            {isSimulationRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span>{isSimulationRunning ? "Stop" : "Start"}</span>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Component Palette */}
        <div className="w-80 bg-white border-r-2 border-purple-200 p-6 overflow-y-auto">
          <h2 className="text-2xl font-black text-gray-800 mb-6">Components 🔧</h2>

          <div className="space-y-4">
            {components.map((component) => (
              <div
                key={component.id}
                onClick={() => setSelectedComponent(component)}
                className={`${component.color} ${
                  selectedComponent?.id === component.id ? "ring-4 ring-purple-400 scale-105" : "hover:scale-105"
                } rounded-2xl p-6 cursor-pointer transition-all shadow-lg`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{component.emoji}</div>
                  <div className="text-xl font-bold text-white">{component.name}</div>
                </div>
              </div>
            ))}
          </div>

          {selectedComponent && (
            <div className="mt-8 p-4 bg-purple-100 rounded-2xl border-2 border-purple-300">
              <div className="text-center">
                <div className="text-2xl mb-2">Selected:</div>
                <div className="text-3xl mb-2">{selectedComponent.emoji}</div>
                <div className="text-lg font-bold text-purple-700">{selectedComponent.name}</div>
                <div className="text-sm text-purple-600 mt-2">Click on the grid to place!</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Circuit Area */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-3xl shadow-2xl h-full p-8 border-2 border-purple-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-gray-800">Breadboard 🍞</h2>
              <div
                className={`px-4 py-2 rounded-xl font-bold ${
                  isSimulationRunning ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {isSimulationRunning ? "⚡ Running" : "⏸️ Stopped"}
              </div>
            </div>

            {/* Breadboard Grid */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 h-[calc(100%-100px)] overflow-auto">
              <div className="grid grid-cols-20 gap-1 max-w-full">
                {Array.from({ length: 15 }, (_, row) =>
                  Array.from({ length: 20 }, (_, col) => {
                    const placedComponent = placedComponents.find((comp) => comp.row === row && comp.col === col);

                    return (
                      <div
                        key={`${row}-${col}`}
                        onClick={() => handleGridClick(row, col)}
                        className={`
                          w-8 h-8 rounded-full border-2 cursor-pointer transition-all
                          ${
                            placedComponent
                              ? `${placedComponent.color} border-gray-400 shadow-lg`
                              : "bg-white border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                          }
                          ${selectedComponent ? "hover:scale-110" : ""}
                          ${isSimulationRunning && placedComponent ? "animate-pulse" : ""}
                        `}
                      >
                        {placedComponent && (
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            {placedComponent.emoji}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center">
              <p className="text-lg text-gray-600">
                {selectedComponent
                  ? `Click on the grid to place your ${selectedComponent.name}! ${selectedComponent.emoji}`
                  : "Select a component from the left panel to start building! 🎯"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
