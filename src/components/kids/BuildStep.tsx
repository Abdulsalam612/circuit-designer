"use client"

import { useState } from "react"
import { ArrowRight, BatteryFull, Check, Cog, Cpu, Lightbulb, Plus, type LucideIcon } from "lucide-react"
import type { KidsCodeMission } from "@/types/kids"
import type { ComponentType } from "@/types/circuit"
import { buildLayout } from "@/lib/kids/mission"
import CircuitThumbnail from "@/components/CircuitThumbnail"
import Button from "@/components/ui/Button"
import { CarShape } from "./CarArt"

// Step 1: fit the parts into the car. Tapping a part places it (no dragging, so it works
// for small hands and keyboards). "Look inside" shows the real circuit as built so far.

const PART_ICON: Partial<Record<ComponentType, LucideIcon>> = { battery: BatteryFull, motor: Cog, lamp: Lightbulb, led: Lightbulb }

// Where each kind of part sits on the car, as % of the stage (the car fills the stage; it
// faces right, see CarArt): the battery in the boot at the back, the motor over the back
// wheel it drives, the light on the headlight at the front, and the hub in the middle by the door
const SLOT_AT: Partial<Record<ComponentType, { left: number; top: number }>> = {
  battery: { left: 6, top: 39 },
  motor: { left: 13, top: 62 },
  lamp: { left: 71, top: 40 },
  led: { left: 71, top: 40 },
}
const HUB_AT = { left: 38, top: 39 }

interface BuildStepProps {
  mission: KidsCodeMission
  placed: ReadonlySet<string>
  onPlace: (componentId: string) => void
  onNext: () => void
}

export default function BuildStep({ mission, placed, onPlace, onNext }: BuildStepProps) {
  const [inside, setInside] = useState(false)
  const typeOf = (id: string) => mission.layout.components.find(c => c.id === id)?.type ?? "resistor"
  const missing = mission.slots.filter(s => !placed.has(s.componentId))
  const done = missing.length === 0
  const lightId = mission.layout.components.find(c => c.type === "lamp" || c.type === "led")?.id

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 p-5 lg:flex-row lg:p-7">
      <section className="flex shrink-0 flex-col gap-3 lg:w-72" aria-labelledby="parts-heading">
        <h2 id="parts-heading" className="font-display text-xl font-semibold tracking-[-0.015em]">Parts box</h2>
        <p className="text-ink-muted">Tap a part to fit it into your car.</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {mission.slots.map(slot => {
            const isIn = placed.has(slot.componentId)
            const Icon = PART_ICON[typeOf(slot.componentId)] ?? Cpu
            return (
              <button
                key={slot.componentId}
                onClick={() => onPlace(slot.componentId)}
                disabled={isIn}
                className={`flex items-center gap-3 rounded-card border-2 p-3 text-left transition-transform active:translate-y-[2px] ${
                  isIn ? "border-success bg-success-tint shadow-[0_3px_0_var(--color-success)]" : "border-line bg-surface shadow-[0_3px_0_var(--color-line-strong)] hover:border-signal/40"
                }`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-control ${isIn ? "bg-surface" : "bg-glow-tint"}`}>
                  <Icon className="h-7 w-7 text-ink" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-lg font-semibold">{slot.label}</span>
                  <span className="block text-sm text-ink-muted">{isIn ? "In the car" : "Tap to add"}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-panel border border-line bg-surface p-4 shadow-key">
          <Button variant="secondary" size="md" className="absolute right-4 top-4 z-10" onClick={() => setInside(v => !v)} aria-pressed={inside}>
            {inside ? "Show the car" : "Look inside"}
          </Button>

          {inside ? (
            <figure className="flex w-full max-w-xl flex-col items-center gap-3">
              <div className="w-full rounded-card border border-line bg-grid">
                <CircuitThumbnail layout={buildLayout(mission, placed)} className="h-64 w-full p-4" />
              </div>
              <figcaption className="max-w-md text-center text-ink-muted">
                The real circuit inside your car. The hub switches port A (the motor) and port B (the light) on and off when your code tells it to.
              </figcaption>
            </figure>
          ) : (
            <div className="relative aspect-[2/1] w-full max-w-2xl">
              <svg viewBox="0 0 170 85" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <line x1={2} y1={82} x2={168} y2={82} stroke="#B8C4D4" strokeWidth={1.2} strokeDasharray="5 4" />
                <CarShape light={lightId && placed.has(lightId) ? 0.4 : 0} />
              </svg>
              {/* Built in, so it's a flat label, not something to press */}
              <div className="absolute flex h-[16%] w-[19%] items-center justify-center rounded-control border-2 border-glow-dark bg-glow-tint text-sm font-semibold"
                style={{ left: `${HUB_AT.left}%`, top: `${HUB_AT.top}%` }}>
                Hub
              </div>
              {mission.slots.map(slot => {
                const at = SLOT_AT[typeOf(slot.componentId)] ?? { left: 40, top: 60 }
                const isIn = placed.has(slot.componentId)
                const style = { left: `${at.left}%`, top: `${at.top}%` }
                const box = "absolute flex overflow-hidden h-[16%] w-[21%] items-center justify-center gap-1 rounded-control border-2 px-1 text-center text-sm font-semibold leading-tight"
                // An empty slot is a button too: tapping it fits that part, like the parts box
                return isIn ? (
                  <div key={slot.componentId} className={`${box} border-success bg-surface`} style={style}>
                    <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={3} aria-hidden="true" />
                    {/* On a phone the car is small: just the tick and a plus, the parts box above has the words */}
                    <span className="hidden sm:inline">{slot.label}</span>
                  </div>
                ) : (
                  <button
                    key={slot.componentId}
                    onClick={() => onPlace(slot.componentId)}
                    className={`${box} border-dashed border-ink-faint bg-surface/85 text-ink-muted shadow-[0_3px_0_var(--color-line-strong)] transition-transform hover:border-signal hover:text-ink active:translate-y-[2px]`}
                    style={style}
                    aria-label={`${slot.label} goes here`}
                  >
                    <Plus className="h-5 w-5 sm:hidden" strokeWidth={3} aria-hidden="true" />
                    <span className="hidden sm:inline">{slot.label} goes here</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className={`flex min-h-16 flex-wrap items-center justify-between gap-3 rounded-card border px-5 py-3 ${done ? "border-success/30 bg-success-tint" : "border-line bg-surface"}`} role="status">
          <span className="text-lg font-semibold">
            {done
              ? "Your car is ready. Now tell it what to do."
              : `${mission.slots.length - missing.length} of ${mission.slots.length} parts in. Still needed: ${missing.map(s => s.label.toLowerCase()).join(", ")}.`}
          </span>
          {done && <Button variant="glow" size="lg" onClick={onNext}>Next: code it <ArrowRight className="h-5 w-5" aria-hidden="true" /></Button>}
        </div>
      </section>
    </div>
  )
}
