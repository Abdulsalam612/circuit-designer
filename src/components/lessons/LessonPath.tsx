import Link from "next/link"
import { BookOpen, Clock, HelpCircle, Lock, Star, Wrench } from "lucide-react"
import type { Lesson } from "@/types/lesson"
import type { LessonState } from "@/lib/lessons"
import Badge from "@/components/ui/Badge"
import StatusLed from "@/components/ui/StatusLed"
import { buttonClass } from "@/components/ui/Button"

// A level's lessons drawn as a circuit: each lesson is an LED on one wire. Lessons unlock in
// order, so the wire is a real sequence. Done = lit green, next = glowing yellow, locked =
// unlit; the stretch of wire between finished lessons is "powered" (blue).

const ACTIVITY = {
  read: { label: "Read", icon: BookOpen },
  quiz: { label: "Quiz", icon: HelpCircle },
  challenge: { label: "Build", icon: Wrench },
} as const

const activities = (lesson: Lesson) =>
  (["read", "quiz", "challenge"] as const).filter(kind => lesson.steps.some(s => s.kind === kind))

const LED_FOR: Record<LessonState, "done" | "active" | "off"> = { completed: "done", available: "active", locked: "off" }
const STATE_LABEL: Record<LessonState, string> = { completed: "Completed", available: "Up next", locked: "Locked" }

interface LessonPathProps {
  lessons: { lesson: Lesson; state: LessonState; number: number }[]
}

export default function LessonPath({ lessons }: LessonPathProps) {
  return (
    <ol className="mt-2">
      {lessons.map(({ lesson, state, number }, i) => {
        const next = lessons[i + 1]
        const powered = state === "completed" && next?.state === "completed"
        return (
          <li key={lesson.id} className="relative pl-10">
            {/* Node on the wire, and the wire down to the next lesson */}
            <span className="absolute left-[9px] top-[30px]" title={STATE_LABEL[state]}>
              <StatusLed state={LED_FOR[state]} />
              <span className="sr-only">{STATE_LABEL[state]}</span>
            </span>
            {next && (
              <span
                aria-hidden="true"
                className={`absolute left-[13px] top-[44px] -bottom-[30px] w-[2.5px] ${powered ? "bg-signal" : "bg-line-strong"}`}
              />
            )}
            <LessonRow lesson={lesson} state={state} number={number} />
          </li>
        )
      })}
    </ol>
  )
}

function LessonRow({ lesson, state, number }: { lesson: Lesson; state: LessonState; number: number }) {
  const locked = state === "locked"
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <h3 className={`font-semibold ${locked ? "text-ink-muted" : "text-ink"}`}>
          <span className="tabular mr-2 text-ink-faint">{number}</span>
          {lesson.title}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{lesson.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex flex-wrap gap-1.5">
            {activities(lesson).map(kind => {
              const { label, icon: Icon } = ACTIVITY[kind]
              return <Badge key={kind} icon={<Icon className="h-3 w-3" />}>{label}</Badge>
            })}
          </span>
          <span className="tabular flex items-center gap-1 text-sm text-ink-muted"><Clock className="h-3.5 w-3.5" />{lesson.minutes} min</span>
          <span className="tabular flex items-center gap-1 text-sm text-ink-muted"><Star className="h-3.5 w-3.5" />{lesson.points} pts</span>
        </div>
      </div>
      <div className="shrink-0 self-center">
        {state === "available" && <span className={buttonClass("primary", "sm")}>Start</span>}
        {state === "completed" && <span className="text-sm font-medium text-success">Review</span>}
        {locked && (
          <span className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Lock className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Finish the one before</span>
          </span>
        )}
      </div>
    </>
  )

  const base = "my-3 flex gap-4 rounded-card border p-4 sm:p-5"
  if (locked) {
    return <div aria-disabled="true" className={`${base} border-line bg-paper`}>{content}</div>
  }
  return (
    <Link
      href={`/learn/${lesson.id}`}
      className={`${base} bg-surface shadow-key transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-lift ${
        state === "available" ? "border-glow-dark/60 ring-2 ring-glow/50" : "border-line"
      }`}
    >
      {content}
    </Link>
  )
}
