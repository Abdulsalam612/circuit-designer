"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, HelpCircle, Lock, Loader2, Trophy, Wrench } from "lucide-react"
import { useRequireAuth } from "@/context/AuthContext"
import { LEVELS } from "@/content/lessons"
import { getLesson, lessonAfter, lessonState } from "@/lib/lessons"
import { completeLesson, loadProgress, EMPTY_PROGRESS, type LearningProgress } from "@/lib/progress"
import type { LessonStep } from "@/types/lesson"
import ProgressBar from "@/components/lessons/ProgressBar"
import ReadStepView from "@/components/lessons/ReadStepView"
import QuizStepView from "@/components/lessons/QuizStepView"
import ChallengeStepView from "@/components/lessons/ChallengeStepView"
import SiteHeader from "@/components/SiteHeader"

const STEP_ICON = { read: BookOpen, quiz: HelpCircle, challenge: Wrench }
const STEP_KIND_LABEL = { read: "Read", quiz: "Quiz", challenge: "Build challenge" }

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <SiteHeader />
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center">{children}</div>
    </div>
  </div>
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
        console.error("Failed to load progress:", err)
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
    return <Centered><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></Centered>
  }

  if (!lesson) {
    return (
      <Centered>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Lesson not found</h1>
        <p className="text-gray-600 mb-6">This lesson doesn&apos;t exist (any more).</p>
        <Link href="/dashboard" className="text-[#2176FF] font-medium hover:underline">Back to lessons</Link>
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
        <Lock className="h-10 w-10 mx-auto text-gray-400 mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{lesson.title} is locked</h1>
        <p className="text-gray-600 mb-6">Finish the lesson before this one to unlock it.</p>
        <Link href="/dashboard" className="text-[#2176FF] font-medium hover:underline">Back to lessons</Link>
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
      console.error("Failed to save lesson progress:", err)
      setSaveError("Couldn't save your progress. Check your connection and try again.")
    } finally {
      setFinishing(false)
    }
  }

  if (finished) {
    return (
      <Centered>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="bg-[#FDCA40] rounded-full p-4 inline-block mb-4">
            <Trophy className="h-8 w-8 text-[#31393C]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Lesson complete!</h1>
          <p className="text-gray-600 mb-2">{lesson.title}</p>
          {finished.pointsEarned > 0 && (
            <p className="text-lg font-semibold text-[#F79824] mb-6">+{finished.pointsEarned} points</p>
          )}
          {finished.pointsEarned === 0 && <p className="text-sm text-gray-500 mb-6">Nice review.</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              All lessons
            </Link>
            {next ? (
              <button
                onClick={() => router.push(`/learn/${next.id}`)}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2176FF] px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Next: {next.title}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="self-center text-sm font-medium text-green-700">You&apos;ve finished every lesson so far!</p>
            )}
          </div>
        </div>
      </Centered>
    )
  }

  const StepIcon = STEP_ICON[step.kind]
  const wide = step.kind === "challenge"

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader sticky={false} />
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Back to lessons">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">Lessons</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">Level {lesson.level}{level ? ` · ${level.title}` : ""}</p>
            <h1 className="font-semibold text-gray-900 truncate">{lesson.title}</h1>
          </div>
          <div className="hidden sm:block w-48">
            <p className="text-xs text-gray-500 text-right mb-1">Step {stepIndex + 1} of {lesson.steps.length}</p>
            <ProgressBar value={stepIndex + (canContinue ? 1 : 0)} max={lesson.steps.length} />
          </div>
        </div>
      </header>

      <main className={`mx-auto px-6 py-8 ${wide ? "max-w-[1400px]" : "max-w-3xl"}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-[#2176FF] mb-1">
          <StepIcon className="h-4 w-4" />
          {STEP_KIND_LABEL[step.kind]}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{step.title}</h2>

        {/* key: each step starts with fresh state */}
        {step.kind === "read" && <ReadStepView key={stepIndex} step={step} />}
        {step.kind === "quiz" && <QuizStepView key={stepIndex} step={step} onPassed={markCurrentPassed} />}
        {step.kind === "challenge" && <ChallengeStepView key={stepIndex} step={step} onPassed={markCurrentPassed} />}

        <nav className="mt-10 flex items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <button
            onClick={() => setStepIndex(i => i - 1)}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            {!canContinue && (
              <p className="text-sm text-gray-500">
                {step.kind === "quiz" ? "Get every answer right to continue" : "Meet all the goals to continue"}
              </p>
            )}
            {isLastStep ? (
              <button
                onClick={finish}
                disabled={!canContinue || finishing}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Finish lesson
              </button>
            ) : (
              <button
                onClick={() => setStepIndex(i => i + 1)}
                disabled={!canContinue}
                className="flex items-center gap-2 rounded-lg bg-[#2176FF] px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </nav>
      </main>
    </div>
  )
}
