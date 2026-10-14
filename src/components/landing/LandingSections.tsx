import Link from "next/link"
import { BookOpen, Mail, Play, Wrench, Zap } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import LevelBadge from "@/components/ui/LevelBadge"
import StatusLed from "@/components/ui/StatusLed"
import { heading, text } from "@/components/ui/typography"
import { CONTACT_EMAIL } from "@/components/SiteFooter"
import { LESSONS, LEVELS } from "@/content/lessons"
import LiveCircuit from "./LiveCircuit"

// Landing page sections. Every claim here must be true today: numbers come from the
// lesson files, and anything not built yet is marked as coming. (The old page had made-up
// user counts and features – keep it honest.)

const FIRST_LESSON = LESSONS[0]

export function Hero() {
  return (
    <section className="bg-grid border-b border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-24">
        <div>
          <h1 className={heading.hero}>Build a circuit. Watch it light up.</h1>
          <p className={`${text.lead} mt-6`}>
            CirKit is a circuit simulator and a step-by-step electronics course in your browser. Drag in parts,
            wire them up and see the current flow. No kit, and nothing to break.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`/learn/${FIRST_LESSON.id}`} size="lg">
              <Play className="h-4 w-4" /> Start the first lesson
            </Button>
            <Button href="/simulation" variant="secondary" size="lg">Open the circuit editor</Button>
          </div>
          <p className={`${text.small} mt-6`}>Free to use, with {LESSONS.length} lessons so far.</p>
          <p className={`${text.small} mt-1`}>
            Younger learner?{" "}
            <Link href="/kids" className="font-medium text-carrot-ink underline underline-offset-4">
              Try CirKit Kids
            </Link>
          </p>
        </div>
        <LiveCircuit />
      </div>
    </section>
  )
}

const STEPS = [
  {
    icon: Wrench,
    title: "Build",
    body: "Drag batteries, resistors, LEDs and switches onto the grid, then drag from one end to another to wire them up.",
  },
  {
    icon: Zap,
    title: "Run",
    body: "CirKit works out the voltage and current everywhere. Lamps and LEDs light up, and it warns you about short circuits and parts that would burn out.",
  },
  {
    icon: BookOpen,
    title: "Learn",
    body: "Lessons explain one idea at a time, then ask you to build it. The simulator checks your circuit, so you know when you've got it right.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <h2 className={heading.xl}>How CirKit works</h2>
        <p className={`${text.lead} mt-4`}>The same three steps an engineer uses, sized for a first circuit.</p>

        {/* A real sequence, so the steps sit on a wire like parts in series */}
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative pl-16 md:pl-0">
              {/* Wire to the next step: down on phones, across from md (spans the column gap) */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[19px] top-10 -bottom-10 w-[2.5px] bg-ink md:left-10 md:right-[-2rem] md:top-[19px] md:bottom-auto md:h-[2.5px] md:w-auto"
                />
              )}
              <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-ink bg-glow font-display text-sm font-semibold text-ink md:relative">
                {i + 1}
              </span>
              <div className="md:mt-6">
                <h3 className={`${heading.lg} flex items-center gap-2`}>
                  <Icon className="h-5 w-5 text-signal" aria-hidden="true" />
                  {title}
                </h3>
                <p className={`${text.body} mt-2 text-ink-muted`}>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Course() {
  return (
    <section id="course" className="scroll-mt-20 border-y border-line bg-grid">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <h2 className={heading.xl}>The course so far</h2>
          <p className={`${text.body} mt-4 text-ink-muted`}>
            {LEVELS.length} levels and {LESSONS.length} lessons, from what electricity is to series and parallel
            circuits. Each lesson ends with a quiz or a build challenge, and more levels are on the way.
          </p>
          <p className={`${text.small} mt-4`}>
            The level markers are resistors: the coloured band is the level number in the resistor colour code. You
            learn to read them in Level 1.
          </p>
          <Button href="/dashboard" variant="secondary" className="mt-8">See all lessons</Button>
        </div>

        <div className="space-y-4">
          {LEVELS.map(level => {
            const lessons = LESSONS.filter(l => l.level === level.level)
            const minutes = lessons.reduce((sum, l) => sum + l.minutes, 0)
            return (
              <Card key={level.level} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <LevelBadge level={level.level} />
                  <span className={`${text.small} tabular`}>{lessons.length} lessons, about {minutes} min</span>
                </div>
                <h3 className={`${heading.md} mt-2`}>{level.title}</h3>
                <p className={`${text.small} mt-1`}>{level.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {lessons.map(lesson => (
                    <li key={lesson.id} className="rounded-chip border border-line bg-paper px-2.5 py-1 text-sm text-ink">
                      {lesson.title}
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const AVAILABLE = [
  "Runs in any modern browser, including school laptops and Chromebooks. Nothing to install.",
  "Build challenges are marked automatically by the simulator.",
  "Each student's progress and circuits are saved to their own account.",
  "Free to use.",
]
const COMING = ["A class view for teachers to follow their students' progress", "Join codes to set up a class in one step"]

export function ForSchools() {
  return (
    <section id="schools" className="scroll-mt-20 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
        <div>
          <h2 className={heading.xl}>For teachers and schools</h2>
          <p className={`${text.lead} mt-4`}>
            Hands-on circuits for a whole class, without boxes of parts to hand out and collect.
          </p>
          <p className={`${text.body} mt-4 text-ink-muted`}>
            CirKit is new and growing. If you&apos;d like to try it with a class, or tell us what your students need,
            we&apos;d love to hear from you.
          </p>
          <Button href={`mailto:${CONTACT_EMAIL}?subject=CirKit%20for%20my%20class`} variant="secondary" className="mt-8">
            <Mail className="h-4 w-4" /> Email us about your class
          </Button>
        </div>

        <Card tone="panel" className="p-6 sm:p-8">
          <h3 className={heading.md}>Ready now</h3>
          <ul className="mt-4 space-y-3">
            {AVAILABLE.map(item => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5"><StatusLed state="done" /></span>
                <span className="text-ink">{item}</span>
              </li>
            ))}
          </ul>
          <h3 className={`${heading.md} mt-8`}>In development</h3>
          <ul className="mt-4 space-y-3">
            {COMING.map(item => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5"><StatusLed state="off" /></span>
                <span className="text-ink-muted">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}

export function FinalCallToAction() {
  return (
    <section className="bg-grid">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Card tone="ink" className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.015em] sm:text-3xl">
              Your first circuit takes about {FIRST_LESSON.minutes} minutes.
            </h2>
            <p className="mt-2 text-white/75">Start with &ldquo;{FIRST_LESSON.title}&rdquo; and light your first lamp.</p>
          </div>
          <Button href={`/learn/${FIRST_LESSON.id}`} variant="glow" size="lg">
            <Play className="h-4 w-4" /> Start the first lesson
          </Button>
        </Card>
      </div>
    </section>
  )
}
