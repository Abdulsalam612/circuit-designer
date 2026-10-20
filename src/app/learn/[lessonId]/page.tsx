"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, HelpCircle, Lock, Loader2, Wrench } from "lucide-react"
import { useRequireAuth } from "@/context/AuthContext"
import { LEVELS } from "@/content/lessons"
import { getLesson, lessonAfter, lessonState } from "@/lib/lessons"
import { completeLesson, loadProgress, EMPTY_PROGRESS, type LearningProgress } from "@/lib/progress"
import type { LessonStep } from "@/types/lesson"
import StepTrack from "@/components/lessons/StepTrack"
import ReadStepView from "@/components/lessons/ReadStepView"
import QuizStepView from "@/components/lessons/QuizStepView"
import ChallengeStepView from "@/components/lessons/ChallengeStepView"
import SiteHeader from "@/components/SiteHeader"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import LevelBadge from "@/components/ui/LevelBadge"
import { heading } from "@/components/ui/typography"
import { reportError } from "@/lib/reportError"

const STEP_ICON = { read: BookOpen, quiz: HelpCircle, challenge: Wrench }
const STEP_KIND_LABEL = { read: "Read", quiz: "Quiz", challenge: "Build challenge" }

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-grid flex flex-col">
    <SiteHeader />
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center">{children}</div>
    </div>
  </div>
)

// A big lit LED for the "lesson complete" moment (the brand's "light it up")
const LitLed = () => (
  <svg viewBox="0 0 64 80" className="mx-auto h-20 w-16" aria-hidden="true">
    <defs>
      <radialGradient id="lit-led" cx="40%" cy="35%" r="65%">
        <stop offset="0" stopColor="#fff7d1" />
        <stop offset="0.45" stopColor="#fdca40" />
        <stop offset="1" stopColor="#f79824" />
      </radialGradient>
      <filter id="lit-led-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
    </defs>
    <circle cx="32" cy="30" r="22" fill="#fdca40" opacity="0.6" filter="url(#lit-led-glow)" />
    <path d="M14 30a18 18 0 0 1 36 0v20H14z" fill="url(#lit-led)" stroke="#c46f0c" strokeWidth="2" />
    <rect x="10" y="50" width="44" height="6" rx="2" fill="#c46f0c" />
    <line x1="24" y1="56" x2="24" y2="78" stroke="#8a959a" strokeWidth="3" strokeLinecap="round" />
    <line x1="40" y1="56" x2="40" y2="72" stroke="#8a959a" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

// Keyed by lesson so "Next lesson" starts the new one from scratch (same route, so
// React would otherwise keep this lesson's step and answers)
export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  return <LessonView key={lessonId} lessonId={lessonId} />
}

const LessonView = ({ lessonId }: { lessonId: string }) => {
  const router = useRouter()
  const { user, loading: authLoading } = useRequireAuth()
  const lesson = getLesson(lessonId)

  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  // Steps finished in this visit (quizzes answered, challenges solved)
  const [passedSteps, setPassedSteps] = useState<Set<number>>(new Set())
  const [finishing, setFinishing] = useState(false)
  const [finished, setFinished] = useState<{ pointsEarned: number } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setProgress(EMPTY_PROGRESS)
      return
    }
    loadProgress(user.uid)
      .then(setProgress)
      .catch((err) => {
        reportError(err, "Load progress (lesson)")
        setProgress(EMPTY_PROGRESS)
      })
  }, [user, authLoading])

  // Start at the top of each step
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [stepIndex, finished])

  const markPassed = useCallback((index: number) => {
    setPassedSteps(prev => (prev.has(index) ? prev : new Set(prev).add(index)))
  }, [])
  const markCurrentPassed = useCallback(() => markPassed(stepIndex), [markPassed, stepIndex])

  if (authLoading || !progress) {
    return <Centered><Loader2 className="h-6 w-6 animate-spin mx-auto text-ink-faint" aria-label="Loading the lesson" /></Centered>
  }

  if (!lesson) {
    return (
      <Centered>
        <h1 className={`${heading.lg} mb-2`}>Lesson not found</h1>
        <p className="mb-6 text-ink-muted">This lesson doesn&apos;t exist (any more).</p>
        <Button href="/dashboard" variant="secondary">Back to your lessons</Button>
      </Centered>
    )
  }

  const completedSet = new Set(progress.completedLessons)
  const state = lessonState(lesson.id, completedSet)
  const level = LEVELS.find(l => l.level === lesson.level)
  const next = lessonAfter(lesson.id)

  if (state === "locked") {
    return (
      <Centered>
        <Lock className="mx-auto mb-4 h-10 w-10 text-ink-faint" />
        <h1 className={`${heading.lg} mb-2`}>{lesson.title} is locked</h1>
        <p className="mb-6 text-ink-muted">Finish the lesson before this one to unlock it.</p>
        <Button href="/dashboard" variant="secondary">Back to your lessons</Button>
      </Centered>
    )
  }

  const step: LessonStep = lesson.steps[stepIndex]
  const isLastStep = stepIndex === lesson.steps.length - 1
  // Reading needs no answer; quizzes and challenges must be done first. Lessons already
  // completed can be stepped through freely.
  const canContinue = step.kind === "read" || passedSteps.has(stepIndex) || state === "completed"

  const finish = async () => {
    if (state === "completed" || !user) {
      setFinished({ pointsEarned: 0 })
      return
    }
    setFinishing(true)
    setSaveError(null)
    try {
      const before = progress.totalPoints
      const updated = await completeLesson(user.uid, lesson)
      setProgress(updated)
      setFinished({ pointsEarned: updated.totalPoints - before })
    } catch (err) {
      reportError(err, "Save lesson progress")
      setSaveError("Couldn't save your progress. Check your connection and try again.")
    } finally {
      setFinishing(false)
    }
  }

  if (finished) {
    return (
      <Centered>
        <Card tone="panel" className="p-8 sm:p-10">
          <LitLed />
          <h1 className={`${heading.xl} mt-4`}>Lesson complete</h1>
          <p className="mt-2 text-ink-muted">{lesson.title}</p>
          {finished.pointsEarned > 0 ? (
            <p className="tabular mt-4 font-display text-2xl font-semibold text-carrot-ink">+{finished.pointsEarned} points</p>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">Good review. Points are only awarded the first time.</p>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/dashboard" variant="secondary">All lessons</Button>
            {next ? (
              <Button onClick={() => router.push(`/learn/${next.id}`)}>
                Next: {next.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <p className="self-center text-sm font-medium text-success">You&apos;ve finished every lesson so far!</p>
            )}
          </div>
        </Card>
      </Centered>
    )
  }

  const StepIcon = STEP_ICON[step.kind]
  const wide = step.kind === "challenge"

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader sticky={false} />
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-control px-2.5 py-2 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
            title="Back to your lessons"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden font-medium sm:inline">Lessons</span>
          </Link>
          <div className="h-6 w-px bg-line" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2">
              <LevelBadge level={lesson.level} />
              {level && <span className="hidden truncate text-xs text-ink-muted sm:inline">{level.title}</span>}
            </p>
            <h1 className="truncate font-display text-base font-semibold tracking-[-0.01em] text-ink sm:text-lg">{lesson.title}</h1>
          </div>
          <StepTrack steps={lesson.steps} current={stepIndex} />
        </div>
      </header>

      <main className={`mx-auto px-5 py-10 sm:px-8 ${wide ? "max-w-[1400px]" : "max-w-3xl"}`}>
        <Badge tone="info" icon={<StepIcon className="h-3.5 w-3.5" />}>
          {STEP_KIND_LABEL[step.kind]}, step {stepIndex + 1} of {lesson.steps.length}
        </Badge>
        <h2 className={`${heading.xl} mt-3 mb-8`}>{step.title}</h2>

        {/* key: each step starts with fresh state */}
        {step.kind === "read" && <ReadStepView key={stepIndex} step={step} />}
        {step.kind === "quiz" && <QuizStepView key={stepIndex} step={step} onPassed={markCurrentPassed} />}
        {step.kind === "challenge" && <ChallengeStepView key={stepIndex} step={step} onPassed={markCurrentPassed} />}

        <nav className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <Button
            variant="ghost"
            onClick={() => setStepIndex(i => i - 1)}
            disabled={stepIndex === 0}
            className={stepIndex === 0 ? "invisible" : ""}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {saveError && <p className="text-sm text-danger" role="alert">{saveError}</p>}
            {!canContinue && (
              <p className="text-sm text-ink-muted">
                {step.kind === "quiz" ? "Get every answer right to continue." : "Meet all the goals to continue."}
              </p>
            )}
            {isLastStep ? (
              <Button onClick={finish} disabled={!canContinue || finishing}>
                {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Finish lesson
              </Button>
            ) : (
              <Button onClick={() => setStepIndex(i => i + 1)} disabled={!canContinue}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </nav>
      </main>
    </div>
  )
}
