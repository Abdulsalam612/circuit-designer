"use client"

import { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import type { QuizStep } from "@/types/lesson"
import Button from "@/components/ui/Button"
import RichText from "./RichText"

interface QuizStepViewProps {
  step: QuizStep;
  // Called once every answer is right
  onPassed: () => void;
}

// Multiple choice. "Check answers" marks each question and explains it; wrong answers
// can be changed and checked again until all are right.
const QuizStepView = ({ step, onPassed }: QuizStepViewProps) => {
  const [answers, setAnswers] = useState<(number | null)[]>(() => step.questions.map(() => null))
  // Which questions have been marked since their answer last changed
  const [marked, setMarked] = useState<boolean[]>(() => step.questions.map(() => false))

  const allAnswered = answers.every(a => a !== null)
  const correctCount = step.questions.filter((q, i) => marked[i] && answers[i] === q.answer).length
  const allCorrect = correctCount === step.questions.length

  const choose = (q: number, option: number) => {
    // Right answers stay locked once marked
    if (marked[q] && answers[q] === step.questions[q].answer) return
    setAnswers(a => a.map((v, i) => (i === q ? option : v)))
    setMarked(m => m.map((v, i) => (i === q ? false : v)))
  }

  const check = () => {
    setMarked(step.questions.map(() => true))
    if (step.questions.every((q, i) => answers[i] === q.answer)) onPassed()
  }

  return (
    <div className="space-y-5">
      {step.questions.map((question, q) => {
        const isMarked = marked[q]
        const isRight = isMarked && answers[q] === question.answer
        return (
          <fieldset key={q} className="rounded-panel border border-line bg-surface p-5 sm:p-6">
            <legend className="sr-only">Question {q + 1}</legend>
            <p className="mb-4 text-[17px] font-medium leading-snug text-ink">
              <span className="tabular mr-2 text-ink-faint">{q + 1}</span>
              <RichText text={question.prompt} />
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {question.options.map((option, o) => {
                const selected = answers[q] === o
                let style = "border-line-strong bg-surface shadow-key hover:border-signal/50 hover:bg-signal-tint"
                if (selected) style = "border-signal bg-signal-tint shadow-[0_2px_0_var(--color-signal)]"
                if (isMarked && selected) {
                  style = isRight
                    ? "border-success bg-success-tint shadow-[0_2px_0_var(--color-success)]"
                    : "border-danger bg-danger-tint shadow-[0_2px_0_var(--color-danger)]"
                }
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => choose(q, o)}
                    aria-pressed={selected}
                    className={`flex items-center gap-3 rounded-control border px-3.5 py-3 text-left text-ink transition-[background-color,border-color,transform] active:translate-y-[2px] ${style}`}
                  >
                    {/* A radio-style dot shows the choice without relying on colour alone */}
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? "border-current" : "border-line-strong"
                      } ${isMarked && selected ? (isRight ? "text-success" : "text-danger") : "text-signal"}`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-current" />}
                    </span>
                    <span>{option}</span>
                  </button>
                )
              })}
            </div>
            {isMarked && (
              <p className={`mt-4 flex gap-2 text-sm ${isRight ? "text-success" : "text-danger"}`} role="status">
                {isRight ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                <span>
                  <strong className="font-semibold">{isRight ? "Correct. " : "Not quite. "}</strong>
                  {/* A wrong answer gets a nudge, not the answer, so it's still worth a retry */}
                  {isRight ? <span className="text-ink"><RichText text={question.explanation} /></span> : "Have another look and try again."}
                </span>
              </p>
            )}
          </fieldset>
        )
      })}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="tabular text-sm text-ink-muted">
          {marked.some(Boolean) ? `${correctCount} of ${step.questions.length} correct` : `${step.questions.length} questions`}
        </p>
        {!allCorrect && (
          <Button onClick={check} disabled={!allAnswered}>Check answers</Button>
        )}
      </div>
    </div>
  )
}

export default QuizStepView
