import Link from "next/link"
import { CheckCircle, Clock, Lock, Play, Star, Wrench, HelpCircle, BookOpen } from "lucide-react"
import type { Lesson } from "@/types/lesson"
import type { LessonState } from "@/lib/lessons"

// What kind of activities a lesson has, for the little tags on the card
const activityTags = (lesson: Lesson) => {
  const kinds = new Set(lesson.steps.map(s => s.kind))
  return [
    kinds.has("read") && { label: "Read", icon: BookOpen },
    kinds.has("quiz") && { label: "Quiz", icon: HelpCircle },
    kinds.has("challenge") && { label: "Build", icon: Wrench },
  ].filter((t): t is { label: string; icon: typeof BookOpen } => !!t)
}

const LessonCard = ({ lesson, state, number }: { lesson: Lesson; state: LessonState; number: number }) => {
  const locked = state === "locked"
  const completed = state === "completed"

  const body = (
    <div
      className={`h-full rounded-xl border p-5 flex flex-col justify-between transition-all ${
        locked
          ? "bg-gray-50 border-gray-200 opacity-60"
          : completed
            ? "bg-green-50/60 border-green-200 hover:shadow-md"
            : "bg-white border-gray-200 hover:shadow-md hover:border-blue-300"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-gray-900">
            <span className="text-gray-400 mr-1.5">{number}.</span>
            {lesson.title}
          </h3>
          {completed && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" aria-label="Completed" />}
          {locked && <Lock className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" aria-label="Locked" />}
        </div>
        <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {activityTags(lesson).map(({ label, icon: Icon }) => (
            <span key={label} className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              <Icon className="h-3 w-3" />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{lesson.minutes} min</span>
          <span className="flex items-center gap-1"><Star className="h-4 w-4" />{lesson.points} pts</span>
        </div>
        {!locked && (
          <span className={`flex items-center gap-1 text-sm font-medium ${completed ? "text-green-700" : "text-[#2176FF]"}`}>
            {completed ? "Review" : <><Play className="h-4 w-4" />Start</>}
          </span>
        )}
        {locked && <span className="text-xs text-gray-500">Finish the previous lesson</span>}
      </div>
    </div>
  )

  return locked ? <div aria-disabled="true">{body}</div> : <Link href={`/learn/${lesson.id}`} className="block h-full">{body}</Link>
}

export default LessonCard
