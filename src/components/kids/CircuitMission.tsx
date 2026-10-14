"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Lightbulb, Power, Repeat2, RotateCcw, RotateCw, Star, Trash2, X } from "lucide-react"
import { simulate } from "@/lib/simulation"
import { boardToLayout, checkGoals, kidsFeedback, pieceLength, rotated } from "@/lib/kids/board"
import { CM_PER_SECOND_AT_FULL_SPEED } from "@/lib/kids/mission"
import type { KidsCircuitMission, Piece, PieceKind } from "@/types/kids"
import KidsTopBar from "./KidsTopBar"
import SnapBoard, { PIECE_NAMES } from "./SnapBoard"
import { CarShape } from "./CarArt"
import StatusLed from "@/components/ui/StatusLed"
import Button from "@/components/ui/Button"

// A Part 1 mission (docs/kids-mode-mvp.md): build a real circuit from snap pieces. The
// simulator runs on every change, so the motor spins and the car drives the moment the loop
// is complete – nothing to press.

interface CircuitMissionProps {
  mission: KidsCircuitMission
  missionNumber: number
  next?: { id: string; title: string }
}

let nextId = 0
const newId = (kind: PieceKind) => `${kind}-${Date.now().toString(36)}-${nextId++}`

export default function CircuitMission({ mission, missionNumber, next }: CircuitMissionProps) {
  const [pieces, setPieces] = useState<Piece[]>(mission.start)
  const [holding, setHolding] = useState<PieceKind | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [won, setWon] = useState(false)

  const result = useMemo(() => simulate(boardToLayout(pieces)), [pieces])
  const goals = useMemo(() => checkGoals(pieces, mission.goals, result), [pieces, mission.goals, result])
  const feedback = kidsFeedback(pieces, result)
  const solved = goals.every(g => g.met)
  // Stars stay once won, even if the child keeps tinkering
  useEffect(() => { if (solved) setWon(true) }, [solved])

  const left = (kind: PieceKind) => (mission.tray.find(t => t.kind === kind)?.count ?? 0) - pieces.filter(p => p.kind === kind && !p.fixed).length
  const selectedPiece = pieces.find(p => p.id === selected) ?? null

  const motorSpeed = pieces.filter(p => p.kind === "motor").map(p => result.readings[p.id]?.speed ?? 0)[0] ?? 0
  const lampLight = Math.max(0, ...pieces.filter(p => p.kind === "lamp").map(p => result.readings[p.id]?.brightness ?? 0))

  const pickUp = (kind: PieceKind) => {
    setSelected(null)
    setHolding(h => (h === kind || left(kind) <= 0 ? null : kind))
  }
  const place = (placement: Pick<Piece, "kind" | "at" | "dir">) => {
    const piece: Piece = { ...placement, id: newId(placement.kind), ...(placement.kind === "switch" ? { closed: false } : {}) }
    setPieces(prev => [...prev, piece])
    // Keep hold of the piece while there are more of it (handy for wires)
    if (left(placement.kind) <= 1) setHolding(null)
  }
  const select = (id: string) => {
    if (holding) return
    const piece = pieces.find(p => p.id === id)
    // A switch is for flicking: tapping it turns it on or off (and shows its actions)
    if (piece?.kind === "switch") {
      update(id, { closed: !piece.closed })
      setSelected(id)
      return
    }
    setSelected(s => (s === id ? null : id))
  }
  const update = (id: string, change: Partial<Piece>) => setPieces(prev => prev.map(p => (p.id === id ? { ...p, ...change } : p)))
  const remove = (id: string) => { setPieces(prev => prev.filter(p => p.id !== id)); setSelected(null) }
  const startAgain = () => { setPieces(mission.start); setHolding(null); setSelected(null) }

  // Escape puts down whatever is picked up
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setHolding(null); setSelected(null) } }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-grid text-ink lg:h-dvh">
      <title>{`${mission.title} – CirKit Kids`}</title>
      <KidsTopBar missionNumber={missionNumber} missionTitle={mission.title} stars={won ? 3 : 0} />

      <div className="flex min-h-0 flex-1 flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:p-7">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4" aria-label="Build your circuit">
          {/* The tray of pieces */}
          <div className="flex flex-wrap items-center gap-2.5" role="toolbar" aria-label="Pieces">
            {mission.tray.map(({ kind }) => {
              const n = left(kind)
              const active = holding === kind
              return (
                <button
                  key={kind}
                  onClick={() => pickUp(kind)}
                  disabled={n <= 0}
                  aria-pressed={active}
                  className={`flex h-14 items-center gap-2.5 rounded-control border-2 pl-3.5 pr-3 sm:pl-2 sm:pr-4 text-[17px] font-semibold transition-colors disabled:opacity-45 ${
                    active ? "border-glow-dark bg-glow-tint" : "border-line bg-surface shadow-key hover:border-line-strong"
                  }`}
                >
                  <TrayIcon kind={kind} />
                  {PIECE_NAMES[kind]}
                  <span className="tabular rounded-full bg-paper px-2 py-0.5 text-sm text-ink-muted">×{n}</span>
                </button>
              )
            })}
            <Button variant="ghost" className="ml-auto" onClick={startAgain}>
              <RotateCcw className="h-4 w-4" /> Start again
            </Button>
          </div>

          {/* What you can do now */}
          <div className="flex min-h-12 flex-wrap items-center gap-2.5 rounded-card border border-line bg-surface px-4 py-2" aria-live="polite">
            {holding ? (
              <>
                <span className="font-medium">
                  {pieceLength(holding) === 1
                    ? "Tap a yellow gap between two studs to put a wire there."
                    : `Tap a yellow stud: the ${PIECE_NAMES[holding].toLowerCase()}'s middle sits on it. Tap the piece afterwards to rotate it.`}
                </span>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setHolding(null)}><X className="h-4 w-4" /> Put it back</Button>
              </>
            ) : selectedPiece ? (
              <>
                <span className="font-semibold">{PIECE_NAMES[selectedPiece.kind]}</span>
                {selectedPiece.kind !== "wire" && (
                  <Button
                    variant="secondary" size="sm"
                    disabled={!rotated(pieces, selectedPiece, mission.board)}
                    onClick={() => {
                      const turned = rotated(pieces, selectedPiece, mission.board)
                      if (turned) update(selectedPiece.id, { at: turned.at, dir: turned.dir })
                    }}
                  >
                    <RotateCw className="h-4 w-4" /> Rotate
                  </Button>
                )}
                {selectedPiece.kind !== "wire" && selectedPiece.kind !== "switch" && (
                  <Button variant="secondary" size="sm" onClick={() => update(selectedPiece.id, { flipped: !selectedPiece.flipped })}>
                    <Repeat2 className="h-4 w-4" /> Turn around
                  </Button>
                )}
                {selectedPiece.kind === "switch" && (
                  <Button variant="glow" size="sm" onClick={() => update(selectedPiece.id, { closed: !selectedPiece.closed })}>
                    <Power className="h-4 w-4" /> Turn {selectedPiece.closed ? "off" : "on"}
                  </Button>
                )}
                {!selectedPiece.fixed && (
                  <Button variant="secondary" size="sm" onClick={() => remove(selectedPiece.id)}>
                    <Trash2 className="h-4 w-4" /> Take it off
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(null)}>Done</Button>
              </>
            ) : (
              <span className="text-ink-muted">Pick a piece from the tray, or tap a piece on the board to change it.</span>
            )}
          </div>

          <div className="min-h-[280px] flex-1 rounded-panel border border-line bg-surface p-3 shadow-key sm:min-h-[340px]">
            <SnapBoard
              board={mission.board}
              pieces={pieces}
              result={result}
              holding={holding}
              selected={selected}
              onPlace={place}
              onSelect={select}
            />
          </div>

          <Track speed={motorSpeed} light={lampLight} />
        </section>

        <aside className="flex shrink-0 flex-col gap-4 lg:w-80 lg:overflow-y-auto">
          {won ? (
            <div className="animate-pop-in rounded-card bg-success p-5 text-white shadow-[0_3px_0_#0B3D1C]">
              <div className="flex gap-1" aria-label="3 of 3 stars">
                {[0, 1, 2].map(i => <Star key={i} className="h-8 w-8 fill-glow text-glow-dark" aria-hidden="true" />)}
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold leading-tight">You did it!</h2>
              <p className="mt-1.5 leading-relaxed text-white/90">You learned: {mission.learn}.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {next ? (
                  <Button variant="glow" href={`/kids/${next.id}`}>Next: {next.title} <ArrowRight className="h-4 w-4" /></Button>
                ) : (
                  <Button variant="glow" href="/kids">More missions <ArrowRight className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-card bg-ink p-5 text-white shadow-[0_3px_0_var(--color-ink-dark)]">
              <p className="text-sm text-white/75">Your mission</p>
              <h2 className="mt-1.5 font-display text-xl font-semibold leading-tight tracking-[-0.015em]">{mission.title}</h2>
              <p className="mt-2.5 leading-relaxed text-white/90">{mission.brief}</p>
            </div>
          )}

          <div className="rounded-card border border-line bg-surface p-4">
            <h3 className="font-display text-base font-semibold">Goals</h3>
            <ul className="mt-2.5 flex flex-col gap-2">
              {goals.map(({ goal, met }) => (
                <li key={goal.text} className="flex items-center gap-2.5">
                  <StatusLed state={met ? "done" : "off"} />
                  <span className={met ? "font-medium" : "text-ink-muted"}>{goal.text}</span>
                  <span className="sr-only">{met ? "– done" : "– not yet"}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`rounded-card border p-4 leading-relaxed ${
              feedback.tone === "good" ? "border-success/40 bg-success-tint" : feedback.tone === "problem" ? "border-carrot-dark/40 bg-carrot-tint" : "border-line bg-surface"
            }`}
            aria-live="polite"
          >
            {feedback.text}
          </div>

          {showHint ? (
            <div className="rounded-card border border-glow-dark/40 bg-glow-tint p-4 leading-relaxed">
              <strong className="font-semibold">Hint:</strong> {mission.hint}
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setShowHint(true)}>
              <Lightbulb className="h-4 w-4" /> Need a hint?
            </Button>
          )}

          <Link href="/kids" className="text-center text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline">
            All missions
          </Link>
        </aside>
      </div>
    </div>
  )
}

// A tiny drawing of each piece for the tray
function TrayIcon({ kind }: { kind: PieceKind }) {
  const fills: Record<PieceKind, string> = {
    wire: "#31393C", battery: "#F79824", motor: "#2176FF", lamp: "#FDCA40", switch: "#22C55E", resistor: "#E9D5B5",
  }
  return (
    <svg viewBox="0 0 40 24" className="hidden h-7 w-11 sm:block" aria-hidden="true">
      {kind === "wire" ? (
        <line x1={5} y1={12} x2={35} y2={12} stroke={fills.wire} strokeWidth={6} strokeLinecap="round" />
      ) : (
        <rect x={3} y={3} width={34} height={18} rx={5} fill={fills[kind]} stroke="#1D2326" strokeOpacity={0.35} strokeWidth={1.5} />
      )}
    </svg>
  )
}

// The car on a strip of road. It drives as fast as the motor turns (backwards if the motor
// runs backwards) and comes round again at the far end.
const ROAD = 1000
function Track({ speed, light }: { speed: number; light: number }) {
  const [x, setX] = useState(40)
  const [turn, setTurn] = useState(0)
  const speedRef = useRef(speed)
  useEffect(() => { speedRef.current = speed }, [speed])

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const s = speedRef.current
      if (Math.abs(s) > 0.02) {
        // 1 cm of track = 6 units here
        const moved = s * CM_PER_SECOND_AT_FULL_SPEED * dt * 6
        setX(v => {
          const n = v + moved
          return n > ROAD ? -170 : n < -170 ? ROAD : n
        })
        setTurn(t => t + moved * 2.4)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const moving = Math.abs(speed) > 0.02
  return (
    <div className="overflow-hidden rounded-card bg-ink-dark" aria-label={moving ? `The car is driving ${speed < 0 ? "backwards" : "forwards"}` : "The car is standing still"} role="img">
      <svg viewBox={`0 0 ${ROAD} 110`} className="block h-auto w-full">
        <rect x={0} y={78} width={ROAD} height={32} fill="#2A3134" />
        <line x1={0} y1={95} x2={ROAD} y2={95} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={3} strokeDasharray="20 18" />
        <g transform={`translate(${x} 2)`}>
          <CarShape light={light} wheelTurn={turn} />
        </g>
      </svg>
    </div>
  )
}
