"use client"

import {
  CircuitBoard, RotateCcw, Play, Pause, Save, Upload, Download, Undo2, Redo2, FolderOpen,
  Check, Loader2, AlertCircle, CloudOff, CheckCircle2, AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropertiesPanel from "../../components/PropertiesPanel";
import Button from "@/components/ui/Button";
import StatusLed from "@/components/ui/StatusLed";
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
  const color = status === "error" ? "text-danger" : status === "saved" ? "text-success" : "text-ink-muted"
  return (
    <span className={`flex items-center gap-1 text-xs ${color}`} title={error ?? undefined}>
      {icon}
      {STATUS_TEXT[status]}
    </span>
  )
}

const toolbarButton = "flex items-center gap-2 rounded-control px-2.5 py-2 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
const divider = <div className="mx-1 h-6 w-px bg-line" aria-hidden="true" />

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
    return <div className="flex min-h-screen items-center justify-center bg-grid text-ink-muted" role="status">{loading ? "Loading the editor…" : "Redirecting to sign in…"}</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      {/* Toolbar: where you are, the circuit's name and save state, then the actions */}
      <header className="shrink-0 border-b border-line bg-surface">
        <div className="flex h-16 items-center justify-between gap-4 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Link href="/" className="mr-1 flex items-center rounded-control bg-brand p-1.5" title="CirKit home" aria-label="CirKit home">
              <CircuitBoard className="h-5 w-5 text-white" />
            </Link>
            <Link href="/circuits" className={toolbarButton}>
              <FolderOpen className="h-4 w-4" />
              <span className="hidden whitespace-nowrap text-sm font-medium md:inline">My Circuits</span>
            </Link>

            {divider}

            <div className="flex min-w-0 flex-col">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => { if (!name.trim()) setName(DEFAULT_CIRCUIT_NAME) }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
                aria-label="Circuit name"
                className="-mx-1 w-56 min-w-0 rounded-chip bg-transparent px-1 font-display text-base font-semibold tracking-[-0.01em] text-ink hover:bg-ink/5 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-signal/30"
              />
              <SaveStatusBadge status={status} error={error} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button onClick={undo} disabled={!canUndo} className={toolbarButton} title="Undo (Ctrl+Z)" aria-label="Undo">
              <Undo2 className="h-4 w-4" />
            </button>
            <button onClick={redo} disabled={!canRedo} className={toolbarButton} title="Redo (Ctrl+Y)" aria-label="Redo">
              <Redo2 className="h-4 w-4" />
            </button>

            {divider}

            <button onClick={() => fileInputRef.current?.click()} className={toolbarButton} title="Open a circuit file">
              <Upload className="h-4 w-4" />
              <span className="hidden text-sm font-medium xl:inline">Import</span>
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
              <span className="hidden text-sm font-medium xl:inline">Export</span>
            </button>
            <button onClick={() => save()} disabled={status === "saving"} className={toolbarButton} title="Save (Ctrl+S)">
              <Save className="h-4 w-4" />
              <span className="hidden text-sm font-medium xl:inline">Save</span>
            </button>
            <button onClick={clearCircuit} className={toolbarButton} title="Remove everything (undoable)">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden text-sm font-medium xl:inline">Clear</span>
            </button>

            {divider}

            {/* Run is the one "light it up" action on this screen */}
            <Button
              variant={isSimulationRunning ? "secondary" : "glow"}
              onClick={() => setIsSimulationRunning(!isSimulationRunning)}
              aria-pressed={isSimulationRunning}
              className="ml-1 min-w-24"
            >
              {isSimulationRunning ? <><Pause className="h-4 w-4" />Stop</> : <><Play className="h-4 w-4" />Run</>}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <CircuitSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Status strip: is it running, messages, zoom */}
          <div className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="shrink-0 whitespace-nowrap">
                <StatusLed
                  state={isSimulationRunning ? (simulation && simulation.warnings.length > 0 ? "warning" : "active") : "off"}
                  label={isSimulationRunning ? "Simulation running" : "Simulation stopped"}
                />
              </span>
              {(notice || error) && (
                <span className={`truncate text-sm ${error && !notice ? "text-danger" : "text-ink-muted"}`} role="status">
                  {notice ?? error}
                </span>
              )}
            </div>
            <div id="zoom-controls-container" className="flex items-center" />
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className="absolute inset-0">
              <CircuitCanvas layout={layout} onLayoutChange={apply} onSelectionChange={setSelectedIds} simulation={simulation} />
            </div>
          </div>
        </div>

        <aside className="flex w-80 shrink-0 flex-col border-l border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-ink">Properties</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {simulation && (
              <div className="mb-5">
                <h3 className="mb-2 text-xs font-medium text-ink-muted">Simulation</h3>
                {simulation.warnings.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-card border border-success/25 bg-success-tint px-3 py-2.5 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Circuit is working. Hover over a part to see its readings.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {simulation.warnings.map((w, i) => (
                      <li key={i} className="flex gap-2 rounded-card border border-carrot/40 bg-carrot-tint px-3 py-2.5 text-sm text-ink">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-carrot-ink" />
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
        </aside>
      </div>
    </div>
  )
}
