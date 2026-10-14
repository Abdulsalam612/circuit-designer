"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { CheckCircle2, Circle, Lightbulb, Pause, Play, RotateCcw, Undo2, Redo2, PartyPopper } from "lucide-react"
import type { ChallengeStep } from "@/types/lesson"
import type { CircuitComponent } from "@/types/circuit"
import { useCircuitHistory, EMPTY_LAYOUT } from "@/hooks/useCircuitHistory"
import { checkChallenge, type GoalResult } from "@/lib/lessons"
import { simulate } from "@/lib/simulation"
import { flipComponent, rotateComponent } from "@/lib/editing"
import PropertiesPanel from "../PropertiesPanel"
import RichText from "./RichText"

const CircuitCanvas = dynamic(() => import("../CircuitCanvas"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full text-gray-500">Loading canvas...</div>,
})
const CircuitSidebar = dynamic(() => import("../CircuitSidebar"), { ssr: false })

interface ChallengeStepViewProps {
  step: ChallengeStep;
  // Called when every goal is met
  onPassed: () => void;
}

const iconButton = "p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:pointer-events-none"

// A small version of the editor with a goal checklist. Goals are checked by the
// simulator when the learner asks, and kept up to date after that.
const ChallengeStepView = ({ step, onPassed }: ChallengeStepViewProps) => {
  const start = step.start ?? EMPTY_LAYOUT
  const { layout, apply, undo, redo, reset, canUndo, canRedo } = useCircuitHistory(start)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [checked, setChecked] = useState(false)
  const [hintsShown, setHintsShown] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)

  const simulation = useMemo(() => (running ? simulate(layout) : null), [running, layout])
  const results: GoalResult[] | null = useMemo(
    () => (checked ? checkChallenge(layout, step.goals) : null),
    [checked, layout, step.goals],
  )
  const solved = !!results && results.every(r => r.passed)

  useEffect(() => {
    if (solved) onPassed()
  }, [solved, onPassed])

  const selected = selectedIds.length === 1 ? layout.components.find(c => c.id === selectedIds[0]) ?? null : null
  const updateComponent = (id: string, patch: Partial<CircuitComponent>) =>
    apply({ ...layout, components: layout.components.map(c => (c.id === id ? { ...c, ...patch } : c)) })

  const rotateSelected = () => {
    if (!selected) return
    const rotated = rotateComponent(layout, selected.id)
    if (rotated) apply(rotated)
    else setNotice("No room to rotate it there.")
  }

  const startOver = useCallback(() => {
    reset(start)
    setChecked(false)
  }, [reset, start])

  // Ctrl+Z / Ctrl+Y, as in the editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return
      const key = e.key.toLowerCase()
      if (key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      else if (key === "y" || (key === "z" && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  return (
    <div className="space-y-4">
      <p className="text-gray-700 leading-relaxed"><RichText text={step.instructions} /></p>

      <div className="flex flex-col lg:flex-row rounded-xl border border-gray-200 bg-white overflow-hidden lg:h-[600px]">
        {/* Parts for this challenge */}
        <div className="lg:h-full shrink-0 [&>div]:w-full lg:[&>div]:w-56">
          <CircuitSidebar types={step.parts} />
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col min-w-0 border-x border-gray-200">
          <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
            <div className="flex items-center gap-1">
              <button onClick={undo} disabled={!canUndo} className={iconButton} title="Undo (Ctrl+Z)"><Undo2 className="h-4 w-4" /></button>
              <button onClick={redo} disabled={!canRedo} className={iconButton} title="Redo (Ctrl+Y)"><Redo2 className="h-4 w-4" /></button>
              <button onClick={startOver} className={iconButton} title="Start this challenge again"><RotateCcw className="h-4 w-4" /></button>
              {notice && <span className="ml-2 text-sm text-gray-600">{notice}</span>}
            </div>
            <div className="flex items-center gap-3">
              <div id="zoom-controls-container" className="hidden md:flex items-center" />
              <button
                onClick={() => setRunning(r => !r)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${running ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
              >
                {running ? <><Pause className="h-4 w-4" />Stop</> : <><Play className="h-4 w-4" />Run</>}
              </button>
            </div>
          </div>
          <div className="relative flex-1 min-h-[420px]">
            <div className="absolute inset-0">
              <CircuitCanvas
                layout={layout}
                onLayoutChange={apply}
                onSelectionChange={setSelectedIds}
                simulation={simulation}
                fitContainer
              />
            </div>
          </div>
        </div>

        {/* Goals, hints and the selected part */}
        <div className="lg:w-72 shrink-0 overflow-y-auto p-4 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Goals</h3>
            <ul className="space-y-2">
              {step.goals.map((goal, i) => {
                const passed = results?.[i]?.passed
                return (
                  <li key={i} className="flex gap-2 text-sm">
                    {passed
                      ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
                      : <Circle className={`h-4 w-4 shrink-0 mt-0.5 ${results ? "text-red-400" : "text-gray-300"}`} />}
                    <span className={passed ? "text-green-700" : "text-gray-700"}>{goal.text}</span>
                  </li>
                )
              })}
            </ul>
            {solved ? (
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm font-medium text-green-700">
                <PartyPopper className="h-4 w-4 shrink-0" />
                Challenge complete!
              </p>
            ) : !checked && (
              <button
                onClick={() => setChecked(true)}
                className="mt-4 w-full rounded-lg bg-[#2176FF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Check my circuit
              </button>
            )}
            {results && !solved && (
              <p className="mt-2 text-xs text-gray-500">Goals update as you change the circuit.</p>
            )}
          </div>

          {step.hints && step.hints.length > 0 && !solved && (
            <div>
              {step.hints.slice(0, hintsShown).map((hint, i) => (
                <p key={i} className="mb-2 flex gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                  <span><RichText text={hint} /></span>
                </p>
              ))}
              {hintsShown < step.hints.length && (
                <button onClick={() => setHintsShown(n => n + 1)} className="text-sm font-medium text-[#2176FF] hover:underline">
                  {hintsShown === 0 ? "Need a hint?" : "Another hint"}
                </button>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <PropertiesPanel
              component={selected}
              selectionCount={selectedIds.length}
              onChange={(patch) => selected && updateComponent(selected.id, patch)}
              onRotate={rotateSelected}
              onFlip={() => selected && apply(flipComponent(layout, selected.id))}
              reading={selected ? simulation?.readings[selected.id] : null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChallengeStepView
