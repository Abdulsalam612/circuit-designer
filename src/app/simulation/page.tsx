"use client"

import {
  ArrowLeft, RotateCcw, Play, Pause, Settings, Save, Upload, Download, Undo2, Redo2, FolderOpen,
  Check, Loader2, AlertCircle, CloudOff, CheckCircle2, AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropertiesPanel from "../../components/PropertiesPanel";
import { useRequireAuth } from "@/context/AuthContext";
import { useCircuitHistory, EMPTY_LAYOUT } from "@/hooks/useCircuitHistory";
import { useCircuitSaving, type SaveStatus } from "@/hooks/useCircuitSaving";
import { circuitFromJson, circuitToJson, DEFAULT_CIRCUIT_NAME } from "@/lib/circuitStore";
import { flipComponent, rotateComponent } from "@/lib/editing";
import { simulate } from "@/lib/simulation";
import type { CircuitComponent, CircuitLayout } from "@/types/circuit";

// Dynamically import Konva components with SSR disabled
const CircuitCanvas = dynamic(() => import("../../components/CircuitCanvas"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full">Loading canvas...</div>
})

const CircuitSidebar = dynamic(() => import("../../components/CircuitSidebar"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full">Loading sidebar...</div>
})

const STATUS_TEXT: Record<SaveStatus, string> = {
  loading: "Loading…",
  new: "Not saved yet",
  unsaved: "Unsaved changes",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Not saved",
}

const SaveStatusBadge = ({ status, error }: { status: SaveStatus; error: string | null }) => {
  const icon = {
    loading: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    new: <CloudOff className="h-3.5 w-3.5" />,
    unsaved: <CloudOff className="h-3.5 w-3.5" />,
    saving: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    saved: <Check className="h-3.5 w-3.5" />,
    error: <AlertCircle className="h-3.5 w-3.5" />,
  }[status]
  const color = status === "error" ? "text-red-600" : status === "saved" ? "text-green-600" : "text-gray-500"
  return (
    <span className={`flex items-center gap-1 text-xs ${color}`} title={error ?? undefined}>
      {icon}
      {STATUS_TEXT[status]}
    </span>
  )
}

const toolbarButton = "flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"

export default function SimulationPage() {
  const { user, loading } = useRequireAuth();
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)

  // The circuit, with undo/redo, and its name
  const { layout, apply, undo, redo, reset, canUndo, canRedo } = useCircuitHistory()
  const [name, setName] = useState(DEFAULT_CIRCUIT_NAME)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLoaded = useCallback((loadedName: string, loadedLayout: CircuitLayout) => {
    setName(loadedName)
    reset(loadedLayout)
  }, [reset])

  const { status, error, save } = useCircuitSaving({
    uid: user?.uid ?? null,
    name,
    layout,
    onLoaded: handleLoaded,
  })

  const selectedComponent =
    selectedIds.length === 1 ? layout.components.find(c => c.id === selectedIds[0]) ?? null : null

  // While running, the circuit is solved again after every change
  const simulation = useMemo(
    () => (isSimulationRunning ? simulate(layout) : null),
    [isSimulationRunning, layout],
  )

  const updateComponent = (id: string, patch: Partial<CircuitComponent>) => {
    apply({ ...layout, components: layout.components.map(c => (c.id === id ? { ...c, ...patch } : c)) })
  }

  const rotateSelected = () => {
    if (!selectedComponent) return
    const rotated = rotateComponent(layout, selectedComponent.id)
    if (rotated) apply(rotated)
    else setNotice("No room to rotate it there.")
  }

  const clearCircuit = () => {
    if (layout.components.length === 0 && layout.wires.length === 0) return
    apply(EMPTY_LAYOUT)
    setNotice("Circuit cleared. Press Ctrl+Z to undo.")
  }

  const exportCircuit = () => {
    const blob = new Blob([circuitToJson(name, layout)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name.trim().replace(/[^\w\- ]+/g, "") || "circuit"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCircuit = async (file: File) => {
    const imported = circuitFromJson(await file.text())
    if (!imported) {
      setNotice("That file isn't a CirKit circuit.")
      return
    }
    // Replaces the current drawing; Ctrl+Z brings it back
    apply(imported.layout)
    setNotice(`Imported "${imported.name}". Press Ctrl+Z to undo.`)
  }

  // Keyboard: Ctrl+Z undo, Ctrl+Y / Ctrl+Shift+Z redo, Ctrl+S save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const target = e.target as HTMLElement | null
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      const key = e.key.toLowerCase()
      if (key === "s") {
        e.preventDefault()
        save()
      } else if (typing) {
        return // let text boxes keep their own undo
      } else if (key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, save])

  // Short messages fade after a few seconds
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  if (loading || !user) {
    return <div className="p-8 text-center">{loading ? "Loading..." : "Redirecting to login..."}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: navigation and circuit name */}
            <div className="flex items-center space-x-3 min-w-0">
              <Link href="/" className={toolbarButton} title="Back to CirKit">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Link href="/circuits" className={toolbarButton}>
                <FolderOpen className="h-4 w-4" />
                <span className="text-sm font-medium whitespace-nowrap">My Circuits</span>
              </Link>

              <div className="h-6 w-px bg-gray-300"></div>

              <div className="flex flex-col min-w-0">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => { if (!name.trim()) setName(DEFAULT_CIRCUIT_NAME) }}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
                  aria-label="Circuit name"
                  className="text-lg font-semibold text-gray-900 bg-transparent rounded px-1 -mx-1 hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 w-56"
                />
                <SaveStatusBadge status={status} error={error} />
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-1 shrink-0">
              <button onClick={undo} disabled={!canUndo} className={toolbarButton} title="Undo (Ctrl+Z)">
                <Undo2 className="h-4 w-4" />
              </button>
              <button onClick={redo} disabled={!canRedo} className={toolbarButton} title="Redo (Ctrl+Y)">
                <Redo2 className="h-4 w-4" />
              </button>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              <button onClick={() => fileInputRef.current?.click()} className={toolbarButton} title="Open a circuit file">
                <Upload className="h-4 w-4" />
                <span className="hidden xl:inline text-sm font-medium">Import</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) importCircuit(file)
                  e.target.value = ""
                }}
              />
              <button onClick={exportCircuit} className={toolbarButton} title="Download as a file">
                <Download className="h-4 w-4" />
                <span className="hidden xl:inline text-sm font-medium">Export</span>
              </button>
              <button onClick={() => save()} disabled={status === "saving"} className={toolbarButton} title="Save (Ctrl+S)">
                <Save className="h-4 w-4" />
                <span className="hidden xl:inline text-sm font-medium">Save</span>
              </button>
              <button onClick={clearCircuit} className={toolbarButton} title="Remove everything (undoable)">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden xl:inline text-sm font-medium">Clear</span>
              </button>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              <button
                onClick={() => setIsSimulationRunning(!isSimulationRunning)}
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
                  {/* Pulses while running */}
                  <span className="relative flex h-3 w-3">
                    {isSimulationRunning && (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                    )}
                    <span className={`relative inline-flex h-3 w-3 rounded-full ${isSimulationRunning ? "bg-green-500" : "bg-gray-400"}`}></span>
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {isSimulationRunning ? "Simulation Running" : "Simulation Stopped"}
                  </span>
                </div>
                {(notice || error) && (
                  <span className={`text-sm ${error && !notice ? "text-red-600" : "text-gray-600"}`}>
                    {notice ?? error}
                  </span>
                )}
              </div>

              <div id="zoom-controls-container" className="flex items-center space-x-4">
                {/* Zoom controls will be injected here from CircuitCanvas */}
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
              <CircuitCanvas layout={layout} onLayoutChange={apply} onSelectionChange={setSelectedIds} simulation={simulation} />
            </div>
          </div>
        </div>
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
            <p className="text-sm text-gray-500 mt-1">Component settings and values</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {simulation && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Simulation</h3>
                {simulation.warnings.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Circuit is working. Hover over a part to see its readings.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {simulation.warnings.map((w, i) => (
                      <li key={i} className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{w.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <PropertiesPanel
              component={selectedComponent}
              selectionCount={selectedIds.length}
              onChange={(patch) => selectedComponent && updateComponent(selectedComponent.id, patch)}
              onRotate={rotateSelected}
              onFlip={() => selectedComponent && apply(flipComponent(layout, selectedComponent.id))}
              reading={selectedComponent ? simulation?.readings[selectedComponent.id] : null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
