"use client"

import { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import type { QuizStep } from "@/types/lesson"
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
    <div className="space-y-6">
      {step.questions.map((question, q) => {
        const isMarked = marked[q]
        const isRight = isMarked && answers[q] === question.answer
        return (
          <fieldset key={q} className="rounded-xl border border-gray-200 bg-white p-5">
            <legend className="sr-only">Question {q + 1}</legend>
            <p className="font-medium text-gray-900 mb-3">
              <span className="text-gray-400 mr-2">{q + 1}.</span>
              <RichText text={question.prompt} />
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {question.options.map((option, o) => {
                const selected = answers[q] === o
                let style = "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                if (selected) style = "border-[#2176FF] bg-blue-50 ring-1 ring-[#2176FF]"
                if (isMarked && selected) style = isRight ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "border-red-400 bg-red-50 ring-1 ring-red-400"
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => choose(q, o)}
                    aria-pressed={selected}
                    className={`text-left rounded-lg border px-4 py-2.5 text-sm text-gray-800 transition-colors ${style}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {isMarked && (
              <p className={`mt-3 flex gap-2 text-sm ${isRight ? "text-green-700" : "text-red-700"}`}>
                {isRight ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                <span>
                  {isRight ? "Correct! " : "Not quite. "}
                  {/* A wrong answer gets a nudge, not the answer, so it's still worth a retry */}
                  {isRight ? <RichText text={question.explanation} /> : "Have another look and try again."}
                </span>
              </p>
            )}
          </fieldset>
        )
      })}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {marked.some(Boolean) ? `${correctCount} of ${step.questions.length} correct` : `${step.questions.length} questions`}
        </p>
        {!allCorrect && (
          <button
            type="button"
            onClick={check}
            disabled={!allAnswered}
            className="rounded-lg bg-[#2176FF] px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check answers
          </button>
        )}
      </div>
    </div>
  )
}

export default QuizStepView
