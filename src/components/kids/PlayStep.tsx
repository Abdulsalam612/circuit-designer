"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Play, RotateCcw, Code2 } from "lucide-react"
import type { Block, KidsCodeMission } from "@/types/kids"
import { flatten, startRun, type RunState } from "@/lib/kids/program"
import { buildLayout, judge, stepMission, MAX_RUN_SECONDS, TICK_SECONDS, type Frame, type Outcome } from "@/lib/kids/mission"
import { describeBlock } from "@/lib/kids/blocks"
import Button from "@/components/ui/Button"
import StatusLed from "@/components/ui/StatusLed"
import { CarShape } from "./CarArt"

// Step 3: run the program for real. Every tick advances the block program, re-solves the
// circuit (lib/kids) and moves the car by the motor's simulated speed.

// The track drawing: viewBox units; the car is 150 long and starts with its front at START_X
const VIEW_W = 1000
const START_X = 160
const END_PAD = 50
const CAR_LENGTH = 150

const KIND_STYLE = {
  motor: "bg-signal text-white",
  light: "bg-carrot-ink text-white",
  control: "bg-success text-white",
  sound: "bg-sound text-white",
}

interface PlayStepProps {
  mission: KidsCodeMission
  placed: ReadonlySet<string>
  program: Block[]
  onSuccess: () => void
  onEditCode: () => void
}

export default function PlayStep({ mission, placed, program, onSuccess, onEditCode }: PlayStepProps) {
  const layout = useMemo(() => buildLayout(mission, placed), [mission, placed])
  const steps = useMemo(() => flatten(program), [program])
  const lightId = mission.layout.components.find(c => c.type === "lamp" || c.type === "led")?.id
  const ports = mission.layout.components.filter(c => c.type === "port").map(c => c.port ?? "")

  const [frame, setFrame] = useState<Frame | null>(null)
  const [running, setRunning] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const timer = useRef<number | null>(null)
  const sim = useRef<{ run: RunState; distance: number } | null>(null)

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
    setRunning(false)
  }
  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current) }, [])

  const tick = () => {
    const s = sim.current
    if (!s) return
    const next = stepMission(layout, mission, s.run, s.distance)
    sim.current = { run: next.run, distance: next.frame.distance }
    setFrame(next.frame)
    const hitWall = next.frame.distance >= mission.trackLength
    const timedOut = next.run.time >= MAX_RUN_SECONDS
    if (next.run.done || hitWall || timedOut) {
      stop()
      const result = judge(mission, next.frame.distance, hitWall, timedOut)
      setOutcome(result)
      if (result === "success") onSuccess()
    }
  }

  const go = () => {
    stop()
    sim.current = { run: startRun(program), distance: 0 }
    setFrame(null)
    setOutcome(null)
    setRunning(true)
    timer.current = window.setInterval(tick, TICK_SECONDS * 1000)
  }

  const reset = () => {
    stop()
    sim.current = null
    setFrame(null)
    setOutcome(null)
  }

  const distance = frame?.distance ?? 0
  const pxPerCm = (VIEW_W - START_X - END_PAD) / mission.trackLength
  const front = START_X + distance * pxPerCm
  const light = lightId ? frame?.hub.brightness[lightId] ?? 0 : 0
  const speed = frame?.hub.speeds[mission.carMotorId] ?? 0
  const { flag, min, max } = mission.goal
  const cm = Math.round(distance)

  const missingPower = !placed.has(mission.carMotorId) || mission.slots.some(s => {
    const c = mission.layout.components.find(x => x.id === s.componentId)
    return c?.type === "battery" && !placed.has(c.id)
  })
  const motorPort = Object.entries(mission.portLabels).find(([, label]) => label === "Motor")?.[0] ?? "A"

  const message: Record<Outcome, { title: string; text: string }> = {
    success: { title: "You stopped on the flag!", text: `The car went ${cm} cm. Your code switched the motor on, waited, then stopped it at just the right time.` },
    short: { title: "Not far enough", text: `The car stopped at ${cm} cm. The flag is at ${flag} cm. Try waiting longer before you stop the motor.` },
    long: { title: "Too far", text: `The car went ${cm} cm, past the flag at ${flag} cm. Try a shorter wait, or a slower speed.` },
    wall: { title: "Bump! The car hit the wall", text: "It drove all the way to the end. Stop the motor sooner." },
    still: missingPower
      ? { title: "The car didn't move", text: "The motor needs the battery to get power. Go back to Build and fit the missing parts." }
      : { title: "The car didn't move", text: `The motor is plugged into port ${motorPort}. Check that a “motor ${motorPort} forward” block is under “when Go is pressed”, before a wait.` },
    timeout: { title: "That took a long time", text: "Your program ran for a whole minute, so we stopped it. Check your waits and repeats." },
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-5 lg:p-7">
      <section className="overflow-hidden rounded-panel border border-line bg-surface shadow-key" aria-label="The track">
        <svg viewBox={`0 0 ${VIEW_W} 300`} className="block h-auto w-full" role="img" aria-label={`The car is ${cm} cm along the track. The flag is at ${flag} cm.`}>
          <defs>
            <pattern id="kids-wall" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="20" fill="#C62828" /><rect x="10" width="10" height="20" fill="#FFFFFF" />
            </pattern>
          </defs>
          <rect x="0" y="210" width={VIEW_W} height="90" fill="#E3E9F2" />
          <line x1="0" y1="252" x2={VIEW_W} y2="252" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="24 20" />
          <rect x={START_X + min * pxPerCm} y="210" width={(max - min) * pxPerCm} height="90" fill="rgba(18,116,54,0.16)" stroke="#127436" strokeDasharray="6 5" strokeWidth="2" />
          <line x1={START_X + flag * pxPerCm} y1="210" x2={START_X + flag * pxPerCm} y2="96" stroke="#31393C" strokeWidth="4" />
          <path d={`M${START_X + flag * pxPerCm + 2} 98 l50 10 l-50 10 z`} fill="#F79824" stroke="#C46F0C" strokeWidth="2" strokeLinejoin="round" />
          <text x={START_X + flag * pxPerCm} y="84" textAnchor="middle" fontSize="16" fontWeight="600" fill="#5B666B">Flag: {flag} cm</text>
          <rect x={VIEW_W - END_PAD + 10} y="210" width={END_PAD - 10} height="90" fill="url(#kids-wall)" />
          {Array.from({ length: Math.floor(mission.trackLength / 20) + 1 }, (_, i) => i * 20).map(mark => (
            <text key={mark} x={START_X + mark * pxPerCm} y="292" textAnchor="middle" fontSize="15" fill="#5B666B">{mark} cm</text>
          ))}
          <g transform={`translate(${front - CAR_LENGTH} 140)`}>
            <CarShape light={light} wheelTurn={distance * 12} />
          </g>
          {frame?.beeping && (
            <g transform={`translate(${front - 90} 104)`}>
              <rect width="76" height="32" rx="14" fill="#7C3AED" />
              <text x="38" y="21" textAnchor="middle" fontSize="16" fontWeight="700" fill="#FFFFFF">Beep!</text>
            </g>
          )}
        </svg>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px_minmax(0,1.2fr)]">
        <div className="min-h-0 overflow-auto rounded-card border border-line bg-surface p-4">
          <h2 className="mb-2.5 text-sm font-semibold text-ink-muted">Your program</h2>
          {steps.length === 0 ? (
            <p className="text-ink-muted">Your program is empty. Add blocks under “when Go is pressed”.</p>
          ) : (
            <ol className="space-y-1.5">
              {steps.map((step, i) => {
                const { text, kind } = describeBlock(step)
                const active = running && frame?.pc === i
                return (
                  <li
                    key={i}
                    aria-current={active ? "step" : undefined}
                    className={`rounded-control px-3 py-2 text-[15px] font-semibold ${KIND_STYLE[kind]} ${active ? "outline outline-4 outline-offset-2 outline-glow" : ""}`}
                  >
                    {text}
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink-muted">What the hub is doing</h2>
          <dl className="space-y-3 text-[15px]">
            {ports.map(port => {
              const level = frame?.levels[port] ?? 0
              return (
                <div key={port} className="flex items-center justify-between gap-3">
                  <dt><StatusLed state={level > 0 ? "done" : "off"} label={`Port ${port} (${mission.portLabels[port]?.toLowerCase()})`} /></dt>
                  <dd className="tabular font-semibold">{level > 0 ? `${Math.round(level * 100)}%` : "Off"}</dd>
                </div>
              )
            })}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-muted">Motor speed</dt>
              <dd className="tabular font-semibold">{Math.round(Math.abs(speed) * 100)}%</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-muted">Distance</dt>
              <dd className="tabular font-semibold">{cm} cm</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          {outcome ? (
            <div role="status" className={`flex-1 rounded-card border p-4 ${outcome === "success" ? "border-success/30 bg-success-tint" : "border-carrot/40 bg-carrot-tint"}`}>
              <p className="font-display text-xl font-semibold tracking-[-0.015em]">{message[outcome].title}</p>
              <p className="mt-1.5 leading-relaxed">{message[outcome].text}</p>
            </div>
          ) : (
            <div className="flex-1 rounded-card border border-dashed border-line-strong bg-surface p-4 leading-relaxed text-ink-muted" role="status">
              {running ? "Running your program…" : "Press Go to run your program. Watch the car and the hub panel to see what each block does."}
            </div>
          )}
          <div className="flex flex-wrap gap-2.5">
            <Button variant="glow" size="lg" onClick={go} disabled={running} className="flex-1">
              <Play className="h-5 w-5" /> Go
            </Button>
            <Button variant="secondary" size="lg" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Back to start
            </Button>
            <Button variant="secondary" size="lg" onClick={onEditCode}>
              <Code2 className="h-4 w-4" /> Change code
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
