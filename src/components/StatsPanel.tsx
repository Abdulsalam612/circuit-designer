import Link from "next/link"
import { Award, BookOpen, CircuitBoard, Clock, HelpCircle, Wrench, type LucideIcon } from "lucide-react"
import ProgressBar from "@/components/lessons/ProgressBar"
import type { LearningStats } from "@/lib/lessons"
import { cardClass } from "@/components/ui/Card"

// The learning dashboard's stats: only numbers we really have (from completed lessons, the
// points total and saved circuits) – no streaks or levels until those are tracked (Stage 6).

interface StatsPanelProps {
  stats: LearningStats
  points: number
  // null while loading or if it couldn't be read
  circuitCount: number | null
}

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export default function StatsPanel({ stats, points, circuitCount }: StatsPanelProps) {
  const percent = stats.lessonsTotal ? Math.round((stats.lessonsDone / stats.lessonsTotal) * 100) : 0

  return (
    <section aria-label="Your stats" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
      <Tile icon={BookOpen} colour="text-signal" label="Lessons" value={`${stats.lessonsDone}/${stats.lessonsTotal}`}>
        <ProgressBar value={stats.lessonsDone} max={stats.lessonsTotal} />
        <span className="mt-1 block">{percent}% of the course</span>
      </Tile>
      <Tile icon={HelpCircle} colour="text-celestial" label="Quizzes passed" value={`${stats.quizzesPassed}/${stats.quizzesTotal}`}>
        All answers right
      </Tile>
      <Tile icon={Wrench} colour="text-carrot-ink" label="Challenges solved" value={`${stats.challengesSolved}/${stats.challengesTotal}`}>
        Checked by the simulator
      </Tile>
      <Tile icon={CircuitBoard} colour="text-brand" label="Circuits saved" value={circuitCount ?? "–"}>
        <Link href="/circuits" className="font-medium text-signal hover:underline">Open My Circuits</Link>
      </Tile>
      <Tile icon={Award} colour="text-success" label="Points" value={points}>
        Earned from lessons
      </Tile>
      <Tile icon={Clock} colour="text-ink-muted" label="Time learning" value={formatMinutes(stats.minutesLearned)}>
        Based on lesson length
      </Tile>
    </section>
  )
}

function Tile({ icon: Icon, colour, label, value, children }: {
  icon: LucideIcon
  colour: string
  label: string
  value: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={cardClass("card", false, "flex flex-col p-4")}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink-muted">{label}</h3>
        <Icon className={`h-5 w-5 shrink-0 ${colour}`} />
      </div>
      <p className="tabular mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
      <div className="mt-auto pt-1 text-xs text-ink-muted">{children}</div>
    </div>
  )
}
