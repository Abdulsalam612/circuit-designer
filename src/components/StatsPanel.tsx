import Link from "next/link"
import { Award, BookOpen, Clock, FolderOpen, type LucideIcon } from "lucide-react"
import ProgressBar from "@/components/lessons/ProgressBar"
import type { LearningStats } from "@/lib/lessons"
import { cardClass } from "@/components/ui/Card"

// The dashboard's stats: only numbers we really have (from completed lessons, the points total
// and saved circuits) – no streaks or levels until those are tracked (Stage 6).
// Three tiles, not six: lessons (the real measure of progress, with a bar), points (the
// reward) and time. Quizzes and challenges are parts of lessons, so they'd repeat the first
// tile; they and the circuit count sit in one quiet line underneath. Icons share one muted
// colour: five hues for five numbers suggested meanings they didn't have.

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
    <section aria-label="Your stats">
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Tile icon={BookOpen} label="Lessons" value={`${stats.lessonsDone}/${stats.lessonsTotal}`}>
          <ProgressBar value={stats.lessonsDone} max={stats.lessonsTotal} />
          <span className="mt-1 block">{percent}% of the course</span>
        </Tile>
        <Tile icon={Award} label="Points" value={points}>
          Earned from lessons
        </Tile>
        <Tile icon={Clock} label="Time learning" value={formatMinutes(stats.minutesLearned)}>
          Based on lesson length
        </Tile>
      </div>
      <div className="tabular mt-3 flex flex-wrap items-center gap-x-4 text-sm text-ink-muted">
        <span>{stats.quizzesPassed} of {stats.quizzesTotal} quizzes passed</span>
        <span>{stats.challengesSolved} of {stats.challengesTotal} build challenges solved</span>
        {circuitCount !== null && <span>{circuitCount} circuit{circuitCount === 1 ? "" : "s"} saved</span>}
        {/* 44 px tall so it's a real target, not a line of small text */}
        <Link href="/circuits" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-signal hover:underline">
          <FolderOpen className="h-4 w-4" aria-hidden="true" />
          Open My Circuits
        </Link>
      </div>
    </section>
  )
}

function Tile({ icon: Icon, label, value, children }: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={cardClass("card", false, "flex flex-col p-4")}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink-muted">{label}</h3>
        <Icon className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
      </div>
      <p className="tabular mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
      <div className="mt-auto pt-1 text-xs text-ink-muted">{children}</div>
    </div>
  )
}
