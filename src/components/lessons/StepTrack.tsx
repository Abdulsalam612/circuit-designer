import { BookOpen, HelpCircle, Wrench } from "lucide-react"
import type { LessonStep } from "@/types/lesson"

// The lesson's steps as nodes on a wire (the same idea as the course path on the dashboard):
// passed steps are lit, the current one glows, upcoming ones are unlit, and the wire is
// powered up to where the learner is. Shows what's coming (e.g. a build challenge at the end).

const KIND = {
  read: { label: "Read", icon: BookOpen },
  quiz: { label: "Quiz", icon: HelpCircle },
  challenge: { label: "Build", icon: Wrench },
} as const

interface StepTrackProps {
  steps: LessonStep[]
  current: number
}

export default function StepTrack({ steps, current }: StepTrackProps) {
  return (
    <ol className="flex items-center" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((step, i) => {
        const { label, icon: Icon } = KIND[step.kind]
        // The current step glows until the learner moves past it
        const done = i < current
        const isCurrent = i === current
        const node = done
          ? "border-success bg-success text-white"
          : isCurrent
            ? "border-glow-dark bg-glow text-ink shadow-[0_0_0_4px_rgb(253_202_64/0.3)]"
            : "border-line-strong bg-surface text-ink-faint"
        return (
          <li key={i} className="flex items-center" aria-current={isCurrent ? "step" : undefined}>
            {i > 0 && (
              <span aria-hidden="true" className={`h-[2.5px] w-4 sm:w-7 ${i <= current ? "bg-signal" : "bg-line-strong"}`} />
            )}
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors sm:h-8 sm:w-8 ${node}`}
              title={`Step ${i + 1}: ${label}`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="sr-only">
                Step {i + 1}: {label}{done ? " (done)" : isCurrent ? " (current)" : ""}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
