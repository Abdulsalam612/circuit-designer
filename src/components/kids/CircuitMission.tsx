"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Lightbulb, Power, Repeat2, RotateCcw, RotateCw, Star, Trash2, X } from "lucide-react"
import { simulate } from "@/lib/simulation"
import { boardToLayout, checkGoals, isThing, kidsFeedback, pieceLength, rotated, testedThings, THINGS } from "@/lib/kids/board"
import { CM_PER_SECOND_AT_FULL_SPEED } from "@/lib/kids/mission"
import type { KidsCircuitMission, PartKind, Piece, PieceKind, Stud, ThingKind } from "@/types/kids"
import KidsTopBar from "./KidsTopBar"
import SnapBoard, { PIECE_NAMES } from "./SnapBoard"
import ThingShape from "./ThingShape"
import { CarShape } from "./CarArt"
import FanScene from "./FanScene"
import TorchScene from "./TorchScene"
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
  // Placing a part takes two taps; this is the first (where it starts)
  const [partStart, setPartStart] = useState<Stud | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [won, setWon] = useState(false)
  // "Does it conduct?": what each everyday thing did when it was tried in a working loop.
  // Kept when the board starts again – it's what the child found out.
  const [findings, setFindings] = useState<ReadonlyMap<ThingKind, boolean>>(new Map())

  const result = useMemo(() => simulate(boardToLayout(pieces)), [pieces])
  const goals = useMemo(
    () => checkGoals(pieces, mission.goals, result, new Set(findings.keys())),
    [pieces, mission.goals, result, findings],
  )
  const feedback = kidsFeedback(pieces, result)
  const solved = goals.every(g => g.met)
  // Stars stay once won, even if the child keeps tinkering
  useEffect(() => { if (solved) setWon(true) }, [solved])

  const hasThings = mission.tray.some(t => isThing(t.kind))
  useEffect(() => {
    if (!hasThings) return
    const now = testedThings(pieces).map(p => p.kind as ThingKind)
    if (now.length === 0) return
    setFindings(prev => {
      if (now.every(k => prev.has(k))) return prev
      const next = new Map(prev)
      now.forEach(k => next.set(k, THINGS[k].conducts))
      return next
    })
  }, [pieces, hasThings])

  const left = (kind: PieceKind) => (mission.tray.find(t => t.kind === kind)?.count ?? 0) - pieces.filter(p => p.kind === kind && !p.fixed).length
  const selectedPiece = pieces.find(p => p.id === selected) ?? null

  const motorSpeed = pieces.filter(p => p.kind === "motor").map(p => result.readings[p.id]?.speed ?? 0)[0] ?? 0
  const lampLight = Math.max(0, ...pieces.filter(p => p.kind === "lamp").map(p => result.readings[p.id]?.brightness ?? 0))

  const pickUp = (kind: PieceKind) => {
    setSelected(null)
    setPartStart(null)
    setHolding(h => (h === kind || left(kind) <= 0 ? null : kind))
  }
  const putBack = () => { setHolding(null); setPartStart(null) }
  const place = (placement: Pick<Piece, "kind" | "at" | "dir" | "flipped">) => {
    setPartStart(null)
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
  const startAgain = () => { setPieces(mission.start); putBack(); setSelected(null) }

  // Escape puts down whatever is picked up; Delete or Backspace takes the selected piece off
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setHolding(null); setPartStart(null); setSelected(null); return }
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        const piece = pieces.find(p => p.id === selected)
        if (!piece || piece.fixed) return
        e.preventDefault()
        setPieces(prev => prev.filter(p => p.id !== selected))
        setSelected(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, pieces])

  return (
    <div className="flex min-h-dvh flex-col bg-grid text-ink lg:h-dvh">
      <title>{`${mission.title} – CirKit Kids`}</title>
      <KidsTopBar missionNumber={missionNumber} missionTitle={mission.title} stars={won ? 3 : 0} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:gap-5 lg:p-6">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4" aria-label="Build your circuit">
          {/* What the circuit powers: the payoff, at the top */}
          <div className="shrink-0">
            {mission.scene === "fan" ? <FanScene speed={motorSpeed} />
              : mission.scene === "torch" ? <TorchScene light={lampLight} />
              : <Track speed={motorSpeed} light={lampLight} />}
          </div>

          {/* One card: what to do now, the board, and the parts box */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-key">
            <div className="flex min-h-14 flex-wrap items-center gap-2 border-b border-line px-4 py-2" aria-live="polite">
              {holding ? (
                <>
                  <span className="font-medium">{placingText(holding, partStart !== null)}</span>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={putBack}><X className="h-4 w-4" aria-hidden="true" /> Put it back</Button>
                </>
              ) : selectedPiece ? (
                <>
                  <span className="mr-1 font-semibold">{PIECE_NAMES[selectedPiece.kind]}</span>
                  {selectedPiece.kind === "switch" && (
                    <Button variant="glow" size="sm" onClick={() => update(selectedPiece.id, { closed: !selectedPiece.closed })}>
                      <Power className="h-4 w-4" aria-hidden="true" /> Turn {selectedPiece.closed ? "off" : "on"}
                    </Button>
                  )}
                  {pieceLength(selectedPiece.kind) === 2 && !selectedPiece.fixed && (
                    <Button
                      variant="secondary" size="sm"
                      disabled={!rotated(pieces, selectedPiece, mission.board)}
                      onClick={() => {
                        const turned = rotated(pieces, selectedPiece, mission.board)
                        if (turned) update(selectedPiece.id, { at: turned.at, dir: turned.dir })
                      }}
                    >
                      <RotateCw className="h-4 w-4" aria-hidden="true" /> Rotate
                    </Button>
                  )}
                  {pieceLength(selectedPiece.kind) === 2 && !selectedPiece.fixed && selectedPiece.kind !== "switch" && (
                    <Button variant="secondary" size="sm" onClick={() => update(selectedPiece.id, { flipped: !selectedPiece.flipped })}>
                      <Repeat2 className="h-4 w-4" aria-hidden="true" /> Turn around
                    </Button>
                  )}
                  {!selectedPiece.fixed && (
                    <Button variant="secondary" size="sm" onClick={() => remove(selectedPiece.id)} aria-keyshortcuts="Delete">
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> Take it off
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(null)}>Done</Button>
                </>
              ) : (
                <span className="text-ink-muted">Pick a piece from the parts box, or tap a piece on the board to change it.</span>
              )}
            </div>

            {/* The board fills whatever room is left (side by side) or keeps its shape (stacked);
                it never sets the height itself, so the parts box stays on screen */}
            <div className="relative aspect-[6/5] min-h-[220px] lg:aspect-auto lg:flex-1">
              <div className="absolute inset-2">
              <SnapBoard
                board={mission.board}
                pieces={pieces}
                result={result}
                holding={holding}
                selected={selected}
                onPlace={place}
                partStart={partStart}
                onPartStart={setPartStart}
                onSelect={select}
                testGap={mission.testGap}
              />
              </div>
            </div>

            {/* The parts box, at the bottom where hands are */}
            <div className="flex flex-wrap items-center gap-2 border-t border-line bg-paper px-3 py-3" role="toolbar" aria-label="Parts box">
              {mission.tray.map(({ kind }) => {
                const n = left(kind)
                const active = holding === kind
                return (
                  <button
                    key={kind}
                    onClick={() => pickUp(kind)}
                    disabled={n <= 0}
                    aria-pressed={active}
                    aria-label={`${PIECE_NAMES[kind]}, ${n} left`}
                    className={`relative flex h-[76px] min-w-[84px] flex-col px-2 items-center justify-center gap-1 rounded-card border-2 text-sm font-semibold transition-colors disabled:opacity-40 ${
                      active ? "border-glow-dark bg-glow-tint" : "border-line bg-surface shadow-key hover:border-line-strong"
                    }`}
                  >
                    <TrayIcon kind={kind} />
                    <span className="whitespace-nowrap leading-tight">{PIECE_NAMES[kind]}</span>
                    <span className="tabular absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-semibold text-white" aria-hidden="true">{n}</span>
                  </button>
                )
              })}
              <Button variant="ghost" size="sm" className="ml-auto" onClick={startAgain}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start again
              </Button>
            </div>
          </div>
        </section>

        <aside className="flex shrink-0 flex-col gap-4 lg:w-80 lg:overflow-y-auto [&>*]:shrink-0">
          {/* The mission: what to do and how you're doing */}
          <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-key">
            {won ? (
              <div className="animate-pop-in bg-success p-5 text-white">
                <div className="flex gap-1" aria-label="3 of 3 stars">
                  {[0, 1, 2].map(i => <Star key={i} className="h-8 w-8 fill-glow text-glow-dark" aria-hidden="true" />)}
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold leading-tight">You did it!</h2>
                <p className="mt-1.5 leading-relaxed text-white/90">You learned: {mission.learn}.</p>
                <Button variant="glow" className="mt-4" href={next ? `/kids/${next.id}` : "/kids"}>
                  {next ? `Next: ${next.title}` : "More missions"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="px-5 pt-5">
                <h2 className="font-display text-xl font-semibold leading-tight tracking-[-0.015em]">{mission.title}</h2>
                <p className="mt-2 leading-relaxed">{mission.brief}</p>
              </div>
            )}

            <ul className="flex flex-col gap-2.5 p-5" aria-label="Goals">
              {goals.map(({ goal, met }) => (
                <li key={goal.text} className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${met ? "border-success bg-success text-white" : "border-line-strong bg-surface"}`} aria-hidden="true">
                    {met && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  <span className={met ? "font-medium" : "text-ink-muted"}>{goal.text}</span>
                  <span className="sr-only">{met ? "– done" : "– not yet"}</span>
                </li>
              ))}
            </ul>

            {hasThings && (
              <div className="border-t border-line p-5">
                <h3 className="font-display text-base font-semibold">What you found out</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {mission.tray.filter(t => isThing(t.kind)).map(({ kind }) => {
                    const thing = kind as ThingKind
                    const found = findings.get(thing)
                    return (
                      <li key={kind} className="flex items-center gap-2.5">
                        <svg viewBox="-44 -34 88 68" className="h-6 w-8 shrink-0" aria-hidden="true"><ThingShape kind={thing} /></svg>
                        <span className="flex-1">{THINGS[thing].name}</span>
                        {found === undefined ? (
                          <span className="text-sm text-ink-muted">Not tested yet</span>
                        ) : found ? (
                          <span className="flex items-center gap-1 text-sm font-semibold text-success"><Check className="h-4 w-4" aria-hidden="true" /> Conducts</span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm font-semibold text-carrot-ink"><X className="h-4 w-4" aria-hidden="true" /> Doesn&apos;t conduct</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* The helper: what's happening in the circuit, and a hint if you want one */}
          <div
            className={`rounded-panel border p-5 leading-relaxed ${
              feedback.tone === "good" ? "border-success/40 bg-success-tint" : feedback.tone === "problem" ? "border-carrot-dark/40 bg-carrot-tint" : "border-line bg-surface"
            }`}
          >
            <p aria-live="polite">{feedback.text}</p>
            {showHint ? (
              <p className="mt-3 border-t border-ink/10 pt-3"><strong className="font-semibold">Hint:</strong> {mission.hint}</p>
            ) : (
              <button onClick={() => setShowHint(true)} className="mt-3 flex items-center gap-1.5 font-semibold text-signal-dark underline-offset-4 hover:underline">
                <Lightbulb className="h-4 w-4" aria-hidden="true" /> Need a hint?
              </button>
            )}
          </div>

          <Link href="/kids" className="text-center text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline">
            All missions
          </Link>
        </aside>
      </div>
    </div>
  )
}

// What the bar above the board says while a piece is held
function placingText(kind: PieceKind, started: boolean) {
  const name = PIECE_NAMES[kind].toLowerCase()
  if (pieceLength(kind) === 1) return `Tap a yellow gap between two studs to put the ${name} there.`
  if (kind === "battery") {
    return started
      ? "Now tap where the battery's − end goes: two studs away, in a straight line."
      : "Tap the stud where the battery's + end goes."
  }
  return started
    ? `Now tap where the ${name} finishes: two studs away, in a straight line.`
    : `Tap the stud where the ${name} starts.`
}

// A tiny drawing of each piece for the tray, like its tile on the board
function TrayIcon({ kind }: { kind: PieceKind }) {
  const box = "h-8 w-12 shrink-0"
  if (isThing(kind)) {
    return <svg viewBox="-44 -34 88 68" className={box} aria-hidden="true"><ThingShape kind={kind} /></svg>
  }
  return (
    <svg viewBox="0 0 48 32" className={box} aria-hidden="true">
      <TrayPart kind={kind} />
    </svg>
  )
}

function TrayPart({ kind }: { kind: "wire" | PartKind }) {
  switch (kind) {
    case "wire":
      return (
        <g>
          <line x1={8} y1={16} x2={40} y2={16} stroke="#31393C" strokeWidth={6} strokeLinecap="round" />
          <circle cx={8} cy={16} r={4} fill="#5B666B" stroke="#1D2326" strokeWidth={1.5} />
          <circle cx={40} cy={16} r={4} fill="#5B666B" stroke="#1D2326" strokeWidth={1.5} />
        </g>
      )
    case "battery":
      return (
        <g>
          <rect x={3} y={6} width={40} height={20} rx={4} fill="#F79824" stroke="#C46F0C" strokeWidth={1.5} />
          <rect x={43} y={12} width={3} height={8} rx={1} fill="#C46F0C" />
          <rect x={16} y={11} width={14} height={10} rx={2} fill="#1D2326" />
          <text x={9} y={21} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1D2326">+</text>
          <text x={37} y={21} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1D2326">−</text>
        </g>
      )
    case "motor":
      return (
        <g>
          <rect x={3} y={6} width={42} height={20} rx={4} fill="#2176FF" stroke="#1048A8" strokeWidth={1.5} />
          <circle cx={24} cy={16} r={8.5} fill="#E8F0FE" stroke="#1048A8" strokeWidth={1.5} />
          {[0, 120, 240].map(r => <path key={r} d="M24 16 L26 9.5 Q24 8 22 9.5 Z" fill="#1048A8" transform={`rotate(${r} 24 16)`} />)}
        </g>
      )
    case "lamp":
      return (
        <g>
          <rect x={3} y={6} width={42} height={20} rx={4} fill="#FFFFFF" stroke="#B9C4C9" strokeWidth={1.5} />
          <circle cx={24} cy={16} r={7.5} fill="#FDCA40" stroke="#5B666B" strokeWidth={1.5} />
          <path d="M21 18 Q22.5 13 24 17 Q25.5 13 27 18" fill="none" stroke="#5B666B" strokeWidth={1.2} />
        </g>
      )
    case "switch":
      return (
        <g>
          <rect x={3} y={6} width={42} height={20} rx={4} fill="#22C55E" stroke="#127436" strokeWidth={1.5} />
          <circle cx={14} cy={19} r={2.5} fill="#1D2326" />
          <circle cx={34} cy={19} r={2.5} fill="#1D2326" />
          <line x1={14} y1={19} x2={31} y2={10} stroke="#1D2326" strokeWidth={3} strokeLinecap="round" />
        </g>
      )
    case "resistor":
      return (
        <g>
          <rect x={3} y={6} width={42} height={20} rx={4} fill="#E9D5B5" stroke="#B89A6A" strokeWidth={1.5} />
          {[16, 22, 28].map((x, i) => <rect key={x} x={x} y={6.75} width={3.5} height={18.5} fill={["#7C3AED", "#1D2326", "#C46F0C"][i]} />)}
        </g>
      )
  }
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
