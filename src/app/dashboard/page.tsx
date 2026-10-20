"use client"

import { useEffect, useState } from "react"
import { Clock, Loader2, Play, Trophy, Zap } from "lucide-react"
import { useRequireAuth } from "@/context/AuthContext"
import { LESSONS, LEVELS } from "@/content/lessons"
import { learningStats, lessonState, nextLesson } from "@/lib/lessons"
import { listCircuits } from "@/lib/circuitStore"
import { loadProgress, type LearningProgress } from "@/lib/progress"
import ProgressBar from "@/components/lessons/ProgressBar"
import LessonPath from "@/components/lessons/LessonPath"
import SiteHeader from "@/components/SiteHeader"
import StatsPanel from "@/components/StatsPanel"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import LevelBadge from "@/components/ui/LevelBadge"
import { heading, text } from "@/components/ui/typography"
import { reportError } from "@/lib/reportError"

// The learning dashboard: what to do next, how far you've got, and the course laid out as a
// circuit (see LessonPath). The old placeholder "Guides" tab and dead "Quick actions" tiles
// were removed in the redesign; old completedGuides data is left in Firestore untouched.

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [progressLoading, setProgressLoading] = useState(true)
  const [circuitCount, setCircuitCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    setProgressLoading(true)
    loadProgress(user.uid)
      .then(setProgress)
      .catch(error => reportError(error, "Load progress (dashboard)"))
      .finally(() => setProgressLoading(false))
    // Only for the stats panel, so a failure just shows "–"
    listCircuits(user.uid)
      .then(circuits => setCircuitCount(circuits.length))
      .catch(() => setCircuitCount(null))
  }, [user])

  if (authLoading || !user || progressLoading || !progress) {
    const message = !authLoading && !user
      ? "Redirecting to sign in…"
      : !progressLoading && !progress
        ? "Your progress couldn't be loaded. Check your connection and reload the page."
        : "Loading your progress…"
    return (
      <div className="min-h-screen bg-grid">
        <SiteHeader />
        <p className="flex items-center justify-center gap-2 p-16 text-ink-muted" role="status">
          {message.startsWith("Loading") && <Loader2 className="h-5 w-5 animate-spin" />}
          {message}
        </p>
      </div>
    )
  }

  const completed = new Set(progress.completedLessons)
  const upNext = nextLesson(completed)
  const firstTime = learningStats(completed).lessonsDone === 0

  return (
    <div className="min-h-screen bg-grid">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 pt-12 pb-8">
          <div>
            <h1 className={heading.xl}>Your learning</h1>
            <p className={`${text.lead} mt-3`}>
              {firstTime ? "Start with the first lesson. Each one takes about ten minutes." : "Pick up where you left off."}
            </p>
          </div>
          <Button href="/simulation" variant="secondary">
            <Zap className="h-4 w-4" /> Open the circuit editor
          </Button>
        </header>

        {/* The one thing to do next */}
        {upNext ? (
          <Card tone="ink" className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-3 text-sm text-white/75">
                <span>{firstTime ? "Start here" : "Up next"}</span>
                <LevelBadge level={upNext.level} onDark />
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] sm:text-3xl">{upNext.title}</h2>
              <p className="mt-2 max-w-[60ch] text-white/75">{upNext.description}</p>
              <p className="tabular mt-3 flex items-center gap-1.5 text-sm text-white/75">
                <Clock className="h-4 w-4" /> About {upNext.minutes} minutes
              </p>
            </div>
            <Button href={`/learn/${upNext.id}`} variant="glow" size="lg" className="shrink-0">
              <Play className="h-4 w-4" /> {firstTime ? "Start lesson" : "Continue"}
            </Button>
          </Card>
        ) : (
          <Card tone="glow" className="flex items-center gap-4 p-6">
            <Trophy className="h-8 w-8 shrink-0 text-carrot-ink" />
            <div>
              <h2 className={heading.md}>You&apos;ve finished every lesson</h2>
              <p className="mt-1 text-ink">More levels are on the way. Until then, try building your own circuits in the editor.</p>
            </div>
          </Card>
        )}

        <div className="mt-8">
          <StatsPanel stats={learningStats(completed)} points={progress.totalPoints} circuitCount={circuitCount} />
        </div>

        <h2 className={`${heading.lg} mt-16`}>The course</h2>
        <p className={`${text.small} mt-2`}>Lessons unlock in order. Finished lessons stay open, so you can review them any time.</p>

        <div className="mt-6 space-y-6">
          {LEVELS.map(level => {
            const lessons = LESSONS.filter(l => l.level === level.level)
            if (lessons.length === 0) return null
            const done = lessons.filter(l => completed.has(l.id)).length
            return (
              <Card key={level.level} tone="panel" className="p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <LevelBadge level={level.level} />
                    <h3 className={`${heading.lg} mt-2`}>{level.title}</h3>
                    <p className={`${text.small} mt-1`}>{level.description}</p>
                  </div>
                  <div className="w-36 shrink-0">
                    <p className="tabular mb-1.5 text-right text-sm text-ink-muted">{done} of {lessons.length} done</p>
                    <ProgressBar value={done} max={lessons.length} color={done === lessons.length ? "bg-success" : "bg-signal"} />
                  </div>
                </div>
                <LessonPath
                  lessons={lessons.map(lesson => ({
                    lesson,
                    state: lessonState(lesson.id, completed),
                    number: LESSONS.indexOf(lesson) + 1,
                  }))}
                />
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
