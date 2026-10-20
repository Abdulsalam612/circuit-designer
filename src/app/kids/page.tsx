import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowLeft, Cpu, Music, Play, TowerControl, Waves, Zap } from "lucide-react"
import { KIDS_MISSIONS } from "@/content/kids"
import type { KidsMission } from "@/types/kids"
import { KidsLogo } from "@/components/kids/KidsTopBar"
import MissionArt from "@/components/kids/MissionArt"

export const metadata: Metadata = {
  title: "CirKit Kids – build it, code it, watch it go",
  description: "Snap real circuits together, then code your machine with blocks and watch it move. For ages 8 to 11.",
}

// The mission map: one tile per mission, in order, each with its own picture and a one-line
// topic. The whole tile is the button. Planned missions (docs/kids-mode-mvp.md) sit at the end
// of their part, dashed and quiet, so children and teachers can see what's coming.

interface Planned { title: string; topic: string; icon: LucideIcon }
const PARTS: { title: string; intro: string; kind: KidsMission["kind"]; coming: Planned[] }[] = [
  {
    title: "Part 1: Build circuits",
    intro: "Snap pieces together and make things happen.",
    kind: "circuit",
    coming: [{ title: "Steady hand game", topic: "Switches you can touch", icon: Zap }],
  },
  {
    title: "Part 2: Code your machine",
    intro: "Give your machine a brain and tell it what to do with blocks.",
    kind: "code",
    coming: [
      { title: "The blinking lighthouse", topic: "Repeat loops", icon: TowerControl },
      { title: "Make a doorbell tune", topic: "When pressed", icon: Music },
      { title: "Stop before the river", topic: "Sensors and if", icon: Waves },
      { title: "Run it on a real micro:bit", topic: "Real hardware", icon: Cpu },
    ],
  },
]

// Each picture sits on a soft tint, so neighbouring tiles look different at a glance
const TINT: Record<string, string> = {
  "make-it-go": "bg-signal-tint",
  faster: "bg-carrot-tint",
  "lights-on": "bg-glow-tint",
  backwards: "bg-paper",
  "gentle-breeze": "bg-signal-tint",
  "does-it-conduct": "bg-glow-tint",
  "drive-to-the-flag": "bg-success-tint",
}

export default function KidsHome() {
  return (
    <div className="min-h-dvh bg-grid text-ink">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-5 py-3 lg:px-7">
        <KidsLogo />
        <Link href="/" className="flex items-center gap-2 rounded-control px-3 py-2 font-medium text-ink-muted hover:bg-ink/5 hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to CirKit
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 lg:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Pick a mission</h1>
        <p className="mt-3 max-w-[52ch] text-lg text-ink-muted">Build circuits that make things move. Then code them.</p>

        {PARTS.map(part => (
          <section key={part.kind} className="mt-12" aria-labelledby={`part-${part.kind}`}>
            <h2 id={`part-${part.kind}`} className="font-display text-2xl font-semibold tracking-[-0.02em]">{part.title}</h2>
            <p className="mt-1.5 text-ink-muted">{part.intro}</p>

            <ol className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
              {KIDS_MISSIONS.map((mission, i) => mission.kind === part.kind && (
                <li key={mission.id}>
                  <Link
                    href={`/kids/${mission.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-key transition-[transform,border-color] hover:-translate-y-0.5 hover:border-signal/50"
                  >
                    <div className={`relative ${TINT[mission.id] ?? "bg-paper"}`}>
                      <MissionArt id={mission.id} />
                      <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-white" aria-hidden="true">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <span className="sr-only">Mission {i + 1}: </span>
                        <span className="block font-display text-lg font-semibold leading-tight tracking-[-0.015em] sm:text-xl">{mission.title}</span>
                        <span className="mt-1.5 inline-block rounded-chip bg-paper px-2 py-0.5 text-sm font-medium text-ink-muted">{mission.topic}</span>
                      </div>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-glow shadow-[0_3px_0_var(--color-glow-dark)] transition-transform group-hover:scale-105" aria-hidden="true">
                        <Play className="ml-0.5 h-5 w-5 fill-ink text-ink" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}

              {part.coming.map(({ title, topic, icon: Icon }) => (
                <li key={title} className="flex flex-col rounded-panel border-2 border-dashed border-line-strong p-4">
                  <div className="flex flex-1 items-center justify-center py-6">
                    <Icon className="h-12 w-12 text-ink-faint" aria-hidden="true" />
                  </div>
                  <span className="font-display text-lg font-semibold leading-tight tracking-[-0.015em] text-ink-muted">{title}</span>
                  <span className="mt-1 text-sm text-ink-muted">{topic}</span>
                  <span className="mt-2 text-sm font-semibold text-carrot-ink">Coming soon</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </main>
    </div>
  )
}
