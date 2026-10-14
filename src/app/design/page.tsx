import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BookOpen, Check, HelpCircle, Lightbulb, Play, Wrench, Zap } from "lucide-react"
import SiteHeader from "@/components/SiteHeader"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import LevelBadge from "@/components/ui/LevelBadge"
import StatusLed from "@/components/ui/StatusLed"
import Field, { inputClass } from "@/components/ui/Field"
import { heading, text } from "@/components/ui/typography"

// Living style guide for the design system. Development only: the live site returns 404.

export const metadata: Metadata = { title: "Design system – CirKit", robots: { index: false } }

const SWATCHES: { name: string; token: string; hex: string; use: string; textOn: "white" | "ink" }[] = [
  { name: "Ink", token: "ink", hex: "#31393C", use: "Text and outlines. 11:1 on paper.", textOn: "white" },
  { name: "Paper", token: "paper", hex: "#F5F8FD", use: "Page background, with the 20 px grid.", textOn: "ink" },
  { name: "Signal", token: "signal", hex: "#1A66E8", use: "Buttons and links. White text 5.1:1.", textOn: "white" },
  { name: "Brand blue", token: "brand", hex: "#2176FF", use: "Logo, icons, focus ring. Not small text.", textOn: "white" },
  { name: "Glow", token: "glow", hex: "#FDCA40", use: "Lit-up highlights. Ink text 7.7:1.", textOn: "ink" },
  { name: "Carrot", token: "carrot", hex: "#F79824", use: "Kids and attention. Ink text 5.3:1.", textOn: "ink" },
  { name: "Celestial", token: "celestial", hex: "#33A1FD", use: "Illustration and tints only.", textOn: "ink" },
  { name: "Success", token: "success", hex: "#127436", use: "Done, saved, passed.", textOn: "white" },
  { name: "Danger", token: "danger", hex: "#C62828", use: "Delete, errors. White text 5.6:1.", textOn: "white" },
]

function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-12">
      <h2 className={heading.lg}>{title}</h2>
      {intro && <p className={`${text.small} mt-2 max-w-[60ch]`}>{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound()

  return (
    <div className="min-h-screen bg-grid">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 sm:px-8 pb-24">
        <header className="py-14">
          <h1 className={heading.xl}>CirKit design system</h1>
          <p className={`${text.lead} mt-4`}>
            Playful but credible: a workbench for building circuits. Tactile controls, colours from the brand, and
            pieces of real electronics (resistor bands, LEDs, grid paper) doing real jobs.
          </p>
        </header>

        <Section title="Colour" intro="Use the token names (bg-signal, text-ink…), never raw hex values. Pairings shown are the ones that pass WCAG AA.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {SWATCHES.map(s => (
              <div key={s.token} className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="flex h-20 items-end p-3" style={{ background: s.hex }}>
                  <span className={`text-sm font-medium ${s.textOn === "white" ? "text-white" : "text-ink"}`}>Aa</span>
                </div>
                <div className="p-3">
                  <p className="font-medium text-ink">{s.name} <span className="tabular text-sm text-ink-muted">{s.hex}</span></p>
                  <p className="mt-0.5 text-sm text-ink-muted">{s.use}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Type" intro="Unbounded for headings, Lexend for everything else. Lexend was designed to make reading easier, which matters for young learners.">
          <div className="space-y-6">
            <p className={heading.hero}>Build it. Light it up.</p>
            <p className={heading.xl}>Series and parallel circuits</p>
            <p className={heading.lg}>Level 1: Basic components</p>
            <p className={heading.md}>Light an LED safely</p>
            <p className={text.lead}>A resistor limits how much current flows. Its value is measured in ohms.</p>
            <p className={text.body}>
              Values are often written with prefixes: k means thousand and M means million. So 4.7 kΩ is 4700 Ω, and
              engineers often write it as 4k7. In the editor, click a resistor and type a new value in the Properties panel.
            </p>
            <p className={text.small}>Small text, for hints and captions.</p>
            <p className="text-ink-muted">
              Readings line up: <span className={text.reading}>9.00 V</span> · <span className={text.reading}>18.4 mA</span> ·{" "}
              <span className={text.reading}>166 mW</span>
            </p>
          </div>
        </Section>

        <Section title="Buttons" intro="Every button sits on a lip and presses down when clicked. One primary action per area; Glow is for the single 'light it up' moment on a screen, like Run.">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button><Play className="h-4 w-4" /> Start lesson</Button>
              <Button variant="secondary">My circuits</Button>
              <Button variant="glow"><Zap className="h-4 w-4" /> Run</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="danger">Delete circuit</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
              <Button href="/dashboard" variant="secondary">A link that looks like a button</Button>
            </div>
          </div>
        </Section>

        <Section title="Containers" intro="Corners grow with size: chips 6 px, controls 10 px, cards 14 px, panels 22 px. Cards that are links lift on hover.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <LevelBadge level={1} />
                  <h3 className={`${heading.md} mt-2`}>Resistors</h3>
                  <p className={`${text.small} mt-1`}>Colour codes, values, and setting a current of 3 mA.</p>
                </div>
                <StatusLed state="done" />
              </div>
              <div className="mt-4 flex gap-2">
                <Badge icon={<BookOpen className="h-3 w-3" />}>Read</Badge>
                <Badge icon={<HelpCircle className="h-3 w-3" />}>Quiz</Badge>
                <Badge icon={<Wrench className="h-3 w-3" />}>Build</Badge>
              </div>
            </Card>
            <Card interactive className="p-5 cursor-pointer">
              <LevelBadge level={2} />
              <h3 className={`${heading.md} mt-2`}>Interactive card</h3>
              <p className={`${text.small} mt-1`}>Hover me: cards that open something lift slightly.</p>
            </Card>
            <Card tone="ink" className="p-5">
              <p className="text-sm text-white/70">Up next</p>
              <h3 className="mt-1 text-lg font-semibold">Capacitors</h3>
              <p className="mt-1 text-sm text-white/70">The one thing on a screen that should stand out.</p>
            </Card>
            <Card tone="glow" className="p-5">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-carrot-ink" />
                <h3 className={heading.md}>The lamp is lit!</h3>
              </div>
              <p className="mt-1 text-sm text-ink">A lit-up / success moment.</p>
            </Card>
          </div>
          <div className="mt-4 rounded-panel border border-line bg-surface p-6">
            <p className="font-medium">Panel</p>
            <p className={`${text.small} mt-1`}>For big sections that hold other things: forms, lists, the lesson body.</p>
          </div>
        </Section>

        <Section title="Levels and status" intro="Levels use the resistor colour code, so the marker teaches something. LEDs show status, always next to a word.">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {Array.from({ length: 10 }, (_, i) => <LevelBadge key={i} level={i} />)}
          </div>
          <div className="mt-6 flex flex-wrap gap-6">
            <StatusLed state="done" label="Completed" />
            <StatusLed state="active" label="In progress" />
            <StatusLed state="warning" label="Check your circuit" />
            <StatusLed state="off" label="Locked" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="info">8 parts</Badge>
            <Badge tone="success" icon={<Check className="h-3 w-3" />}>Verified</Badge>
            <Badge tone="warning">Not verified</Badge>
            <Badge tone="danger">Short circuit</Badge>
            <Badge tone="glow">New</Badge>
          </div>
        </Section>

        <Section title="Forms">
          <div className="grid max-w-xl gap-5">
            <Field label="Display name" htmlFor="ds-name" hint="How you appear in CirKit.">
              <input id="ds-name" className={inputClass} defaultValue="Ada Lovelace" />
            </Field>
            <Field label="Email" htmlFor="ds-email" optional>
              <input id="ds-email" type="email" className={inputClass} placeholder="you@example.com" />
            </Field>
            <Field label="Resistance" htmlFor="ds-value" error="Use a number with an optional prefix, like 4.7k or 330.">
              <input id="ds-value" className={inputClass} defaultValue="4.7 kilo" aria-invalid="true" />
            </Field>
          </div>
        </Section>
      </main>
    </div>
  )
}
