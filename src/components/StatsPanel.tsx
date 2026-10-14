import Link from "next/link"
import { Award, BookOpen, CircuitBoard, Clock, HelpCircle, Wrench, type LucideIcon } from "lucide-react"
import ProgressBar from "@/components/lessons/ProgressBar"
import type { LearningStats } from "@/lib/lessons"

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
      <Tile icon={BookOpen} colour="text-[#2176FF]" label="Lessons" value={`${stats.lessonsDone}/${stats.lessonsTotal}`}>
        <ProgressBar value={stats.lessonsDone} max={stats.lessonsTotal} />
        <span className="mt-1 block">{percent}% of the course</span>
      </Tile>
      <Tile icon={HelpCircle} colour="text-purple-500" label="Quizzes passed" value={`${stats.quizzesPassed}/${stats.quizzesTotal}`}>
        All answers right
      </Tile>
      <Tile icon={Wrench} colour="text-[#F79824]" label="Challenges solved" value={`${stats.challengesSolved}/${stats.challengesTotal}`}>
        Checked by the simulator
      </Tile>
      <Tile icon={CircuitBoard} colour="text-[#33A1FD]" label="Circuits saved" value={circuitCount ?? "–"}>
        <Link href="/circuits" className="font-medium text-[#2176FF] hover:underline">My Circuits →</Link>
      </Tile>
      <Tile icon={Award} colour="text-green-500" label="Points" value={points}>
        Earned from lessons
      </Tile>
      <Tile icon={Clock} colour="text-gray-500" label="Time learning" value={formatMinutes(stats.minutesLearned)}>
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
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        <Icon className={`h-5 w-5 shrink-0 ${colour}`} />
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      <div className="mt-auto pt-1 text-xs text-gray-500">{children}</div>
    </div>
  )
}
