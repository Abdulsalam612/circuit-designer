import Link from "next/link"
import { Lightbulb, Star } from "lucide-react"

// CirKit Kids' own top bar: the kids logo (back to the missions), the mission, the three
// steps on a wire (Build → Code → Play, for code missions only) and the stars won. Larger than the site header:
// it's made for tablets and small hands.

export type KidsStep = "build" | "code" | "play"
const STEPS: { id: KidsStep; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "code", label: "Code" },
  { id: "play", label: "Play" },
]

export function KidsLogo() {
  return (
    <Link href="/kids" className="flex items-center gap-3" aria-label="CirKit Kids missions">
      <span className="flex h-11 w-11 items-center justify-center rounded-control bg-carrot shadow-[0_3px_0_var(--color-carrot-dark)]">
        <Lightbulb className="h-6 w-6 text-ink" aria-hidden="true" />
      </span>
      <span className="font-display text-xl font-bold tracking-[-0.02em] text-ink">CirKit Kids</span>
    </Link>
  )
}

interface KidsTopBarProps {
  missionNumber: number
  missionTitle: string
  // Circuit missions are one screen, so they leave the steps out
  step?: KidsStep
  onStep?: (step: KidsStep) => void
  stars: number
}

export default function KidsTopBar({ missionNumber, missionTitle, step, onStep, stars }: KidsTopBarProps) {
  const current = STEPS.findIndex(s => s.id === step)
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line bg-surface px-5 py-3 lg:px-7">
      <div className="flex items-center gap-4">
        <KidsLogo />
        <span className="hidden text-ink-muted md:inline">Mission {missionNumber}: {missionTitle}</span>
      </div>

      {step && onStep && <nav aria-label="Steps" className="flex items-center">
        {STEPS.map((s, i) => {
          const active = i === current
          const done = i < current
          return (
            <div key={s.id} className="flex items-center">
              {i > 0 && <span aria-hidden="true" className={`h-[3px] w-6 sm:w-9 ${i <= current ? "bg-signal" : "bg-line-strong"}`} />}
              <button
                onClick={() => onStep(s.id)}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${s.label}`}
                className={`flex h-12 items-center gap-2.5 rounded-full border-2 p-1 text-[17px] font-semibold transition-colors sm:pl-1.5 sm:pr-4 ${
                  active ? "border-glow-dark bg-glow-tint" : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-sm ${
                  done ? "bg-success text-white" : active ? "bg-glow text-ink" : "bg-paper text-ink"
                }`}>
                  {i + 1}
                </span>
                {/* Phones show just the numbers */}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </div>
          )
        })}
      </nav>}

      <div className="flex items-center gap-2 text-[17px] font-semibold" aria-label={`${stars} of 3 stars`}>
        <Star className="h-7 w-7 fill-glow text-glow-dark" aria-hidden="true" />
        <span className="tabular">{stars} / 3</span>
      </div>
    </header>
  )
}
