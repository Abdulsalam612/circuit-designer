"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Lightbulb, Pause, Play, RotateCcw, Undo2, Redo2, PartyPopper } from "lucide-react"
import type { ChallengeStep } from "@/types/lesson"
import type { CircuitComponent } from "@/types/circuit"
import { useCircuitHistory, EMPTY_LAYOUT } from "@/hooks/useCircuitHistory"
import { checkChallenge, type GoalResult } from "@/lib/lessons"
import { simulate } from "@/lib/simulation"
import { flipComponent, rotateComponent } from "@/lib/editing"
import PropertiesPanel from "../PropertiesPanel"
import RichText from "./RichText"
import Button from "@/components/ui/Button"
import StatusLed from "@/components/ui/StatusLed"

const CircuitCanvas = dynamic(() => import("../CircuitCanvas"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center text-ink-muted">Loading the workbench…</div>,
})
const CircuitSidebar = dynamic(() => import("../CircuitSidebar"), { ssr: false })

interface ChallengeStepViewProps {
  step: ChallengeStep;
  // Called when every goal is met
  onPassed: () => void;
}

const iconButton = "rounded-control p-2 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-40"

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
      <p className="max-w-[68ch] text-[17px] leading-relaxed text-ink sm:text-lg"><RichText text={step.instructions} /></p>

      <div className="flex flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-key lg:h-[600px] lg:flex-row">
        {/* Parts for this challenge */}
        <div className="lg:h-full shrink-0 [&>div]:w-full lg:[&>div]:w-56">
          <CircuitSidebar types={step.parts} />
        </div>

        {/* Canvas */}
        <div className="flex min-w-0 flex-1 flex-col border-line lg:border-x">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div className="flex items-center gap-1">
              <button onClick={undo} disabled={!canUndo} className={iconButton} title="Undo (Ctrl+Z)"><Undo2 className="h-4 w-4" /></button>
              <button onClick={redo} disabled={!canRedo} className={iconButton} title="Redo (Ctrl+Y)"><Redo2 className="h-4 w-4" /></button>
              <button onClick={startOver} className={iconButton} title="Start this challenge again"><RotateCcw className="h-4 w-4" /></button>
              {notice && <span className="ml-2 text-sm text-ink-muted" role="status">{notice}</span>}
            </div>
            <div className="flex items-center gap-3">
              <div id="zoom-controls-container" className="hidden md:flex items-center" />
              {/* Run is the one "light it up" action on this screen */}
              <Button size="sm" variant={running ? "secondary" : "glow"} onClick={() => setRunning(r => !r)} aria-pressed={running}>
                {running ? <><Pause className="h-4 w-4" />Stop</> : <><Play className="h-4 w-4" />Run</>}
              </Button>
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
        <div className="shrink-0 space-y-5 overflow-y-auto border-t border-line p-4 lg:w-72 lg:border-t-0">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink">Goals</h3>
            {/* Each goal is an LED: unlit until checked, then green when met, orange when not yet */}
            <ul className="space-y-2.5">
              {step.goals.map((goal, i) => {
                const passed = results?.[i]?.passed
                return (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="mt-1"><StatusLed state={passed ? "done" : results ? "warning" : "off"} /></span>
                    <span className={passed ? "text-success" : "text-ink"}>
                      {goal.text}
                      {results && <span className="sr-only">{passed ? " (met)" : " (not yet)"}</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
            {solved ? (
              <p className="mt-4 flex items-center gap-2 rounded-card border border-glow-dark/40 bg-glow-tint px-3 py-2.5 text-sm font-medium text-ink shadow-[0_2px_0_var(--color-glow-dark)]" role="status">
                <PartyPopper className="h-4 w-4 shrink-0 text-carrot-ink" />
                Challenge complete!
              </p>
            ) : !checked && (
              <Button onClick={() => setChecked(true)} size="sm" className="mt-4 w-full">Check my circuit</Button>
            )}
            {results && !solved && (
              <p className="mt-2 text-xs text-ink-muted">Goals update as you change the circuit.</p>
            )}
          </div>

          {step.hints && step.hints.length > 0 && !solved && (
            <div>
              {step.hints.slice(0, hintsShown).map((hint, i) => (
                <p key={i} className="mb-2 flex gap-2 rounded-control border border-glow-dark/40 bg-glow-tint px-3 py-2 text-sm text-ink">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-carrot-ink" />
                  <span><RichText text={hint} /></span>
                </p>
              ))}
              {hintsShown < step.hints.length && (
                <button onClick={() => setHintsShown(n => n + 1)} className="text-sm font-medium text-signal hover:underline">
                  {hintsShown === 0 ? "Need a hint?" : "Another hint"}
                </button>
              )}
            </div>
          )}

          <div className="border-t border-line pt-4">
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
