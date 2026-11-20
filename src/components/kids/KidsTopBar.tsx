import Link from "next/link"
import Wordmark from "@/components/Wordmark"
import { ArrowLeft, Star } from "lucide-react"

// CirKit Kids' own top bar: a big "Missions" button back to the map, the mission, the three
// steps on a wire (Build → Code → Play, for code missions only) and the stars won. Larger than
// the site header: it's made for tablets and small hands.

export type KidsStep = "build" | "code" | "play"
const STEPS: { id: KidsStep; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "code", label: "Code" },
  { id: "play", label: "Play" },
]

// The shared CirKit Kids wordmark (components/Wordmark), at the tablet size
export function KidsLogo() {
  return <Wordmark variant="kids" size="lg" />
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
  const hasSteps = !!(step && onStep)
  return (
    // One row at every width (it never wraps): the title shrinks first, then the step labels go
    <header className="flex shrink-0 flex-nowrap items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:gap-5 sm:px-5 lg:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <span className="hidden xl:flex"><KidsLogo /></span>
        {/* Looks like a secondary Button, but 48 px tall and narrower on phones */}
        <Link
          href="/kids" aria-label="Missions: back to the mission map"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-control border border-line-strong bg-surface px-3 font-semibold text-ink shadow-key transition-[transform,box-shadow,background-color] duration-100 hover:border-signal/40 hover:bg-signal-tint active:translate-y-[2px] active:shadow-none sm:px-4"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          {/* With the steps beside it, phones only have room for the arrow */}
          <span className={hasSteps ? "hidden sm:inline" : undefined}>Missions</span>
        </Link>
        <span className={`min-w-0 truncate font-semibold ${hasSteps ? "hidden lg:block" : "block"}`} title={`Mission ${missionNumber}: ${missionTitle}`}>
          <span className="hidden font-normal text-ink-muted sm:inline">Mission {missionNumber}: </span>{missionTitle}
        </span>
      </div>

      {hasSteps && <nav aria-label="Steps" className="flex shrink-0 items-center">
        {STEPS.map((s, i) => {
          const active = i === current
          const done = i < current
          return (
            <div key={s.id} className="flex items-center">
              {i > 0 && <span aria-hidden="true" className={`h-[3px] w-4 sm:w-6 md:w-9 ${i <= current ? "bg-signal" : "bg-line-strong"}`} />}
              <button
                onClick={() => onStep!(s.id)}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${s.label}`}
                className={`flex h-12 items-center gap-2.5 rounded-full border-2 p-1 text-[17px] font-semibold transition-colors md:pl-1.5 md:pr-4 ${
                  active ? "border-glow-dark bg-glow-tint" : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-sm ${
                  done ? "bg-success text-white" : active ? "bg-glow text-ink" : "bg-paper text-ink"
                }`}>
                  {i + 1}
                </span>
                {/* Phones and small tablets show just the numbers */}
                <span className="hidden md:inline">{s.label}</span>
              </button>
            </div>
          )
        })}
      </nav>}

      <div className="flex shrink-0 items-center gap-1.5 text-[17px] font-semibold sm:gap-2" aria-label={`${stars} of 3 stars`}>
        <Star className="h-7 w-7 fill-glow text-glow-dark" aria-hidden="true" />
        <span className="tabular whitespace-nowrap">{stars} / 3</span>
      </div>
    </header>
  )
}
