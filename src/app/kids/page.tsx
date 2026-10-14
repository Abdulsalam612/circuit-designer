import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowLeft, Cpu, KeyRound, Music, Play, TowerControl, Waves } from "lucide-react"
import { KIDS_MISSIONS } from "@/content/kids"
import type { KidsMission } from "@/types/kids"
import { KidsLogo } from "@/components/kids/KidsTopBar"
import { CarShape } from "@/components/kids/CarArt"

export const metadata: Metadata = {
  title: "CirKit Kids – build it, code it, watch it go",
  description: "Snap real circuits together, then code your machine with blocks and watch it move. For ages 8 to 11.",
}

// Planned missions (docs/kids-mode-mvp.md), shown so children and teachers can see what's coming.
// They aren't playable yet, and say so.
interface Planned { title: string; learn: string; icon: LucideIcon }
const PARTS: { title: string; intro: string; kind: KidsMission["kind"]; coming: Planned[] }[] = [
  {
    title: "Part 1: Build circuits",
    intro: "Snap pieces together and make things happen. No code yet – just electricity.",
    kind: "circuit",
    coming: [
      { title: "Does it conduct?", learn: "which things let electricity through", icon: KeyRound },
    ],
  },
  {
    title: "Part 2: Code your machine",
    intro: "Swap the switch for a hub, then tell it what to do with blocks.",
    kind: "code",
    coming: [
      { title: "The blinking lighthouse", learn: "repeat loops", icon: TowerControl },
      { title: "Make a doorbell tune", learn: "events, “when pressed”", icon: Music },
      { title: "Stop before the river", learn: "sensors and “if”", icon: Waves },
      { title: "Run it on a real micro:bit", learn: "your blocks on real hardware", icon: Cpu },
    ],
  },
]

// The picture on a mission card: the desk fan, a circuit loop with the car (Part 1), or the
// car on its track (Part 2)
function CardArt({ mission }: { mission: KidsMission }) {
  if (mission.kind === "circuit" && mission.scene === "fan") {
    return (
      <svg viewBox="0 0 520 220" className="block h-auto w-full" aria-hidden="true">
        <rect x="0" y="176" width="520" height="44" fill="#8A6A4C" />
        <ellipse cx="150" cy="176" rx="50" ry="9" fill="#1D2326" />
        <rect x="143" y="110" width="14" height="66" rx="5" fill="#5B666B" />
        <circle cx="150" cy="96" r="62" fill="#3D474B" stroke="#FFFFFF" strokeWidth="5" />
        {[0, 120, 240].map(r => (
          <path key={r} d="M150 96 Q125 56 150 40 Q175 56 150 96 Z" fill="#2176FF" stroke="#1048A8" strokeWidth="2" transform={`rotate(${r + 20} 150 96)`} />
        ))}
        <circle cx="150" cy="96" r="10" fill="#1048A8" />
        {[70, 100, 130].map(y => <path key={y} d={`M235 ${y} q25 -8 50 0 t50 0 t50 0`} fill="none" stroke="#8AB4F8" strokeWidth="4" strokeLinecap="round" strokeDasharray="16 14" />)}
        <rect x="380" y="164" width="110" height="9" rx="2" fill="#FFFFFF" />
        <rect x="374" y="154" width="110" height="9" rx="2" fill="#FFFFFF" />
        <rect x="420" y="70" width="80" height="9" rx="2" fill="#FFFFFF" transform="rotate(-22 460 74)" />
      </svg>
    )
  }
  if (mission.kind === "circuit") {
    return (
      <svg viewBox="0 0 520 220" className="block h-auto w-full" aria-hidden="true">
        <rect x="150" y="40" width="220" height="140" rx="18" fill="none" stroke="#31393C" strokeWidth="12" />
        <rect x="150" y="40" width="220" height="140" rx="18" fill="none" stroke="#FDCA40" strokeWidth="5" strokeDasharray="0.1 18" strokeLinecap="round" />
        <rect x="120" y="76" width="60" height="68" rx="12" fill="#F79824" stroke="#C46F0C" strokeWidth="3" />
        <text x="150" y="104" textAnchor="middle" fontSize="26" fontWeight="700" fill="#1D2326">+</text>
        <text x="150" y="136" textAnchor="middle" fontSize="26" fontWeight="700" fill="#1D2326">−</text>
        <rect x="216" y="10" width="88" height="60" rx="12" fill="#2176FF" stroke="#1048A8" strokeWidth="3" />
        <circle cx="260" cy="40" r="20" fill="#E8F0FE" stroke="#1048A8" strokeWidth="2.5" />
        <path d="M260 40 L265 23 Q260 19 255 23 Z M260 40 L272 53 Q276 48 274 43 Z M260 40 L243 46 Q245 52 250 53 Z" fill="#1048A8" />
        <g transform="translate(330 136) scale(0.9)"><CarShape light={0} /></g>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 520 220" className="block h-auto w-full" aria-hidden="true">
      <rect x="0" y="150" width="520" height="70" fill="#2A3134" />
      <line x1="0" y1="186" x2="520" y2="186" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="24 20" />
      <rect x="360" y="150" width="80" height="70" fill="rgba(34,197,94,0.25)" />
      <line x1="400" y1="40" x2="400" y2="150" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M402 42 L452 52 L402 62 Z" fill="#F79824" />
      <g transform="translate(60 74)"><CarShape light={0.6} /></g>
    </svg>
  )
}

export default function KidsHome() {
  return (
    <div className="min-h-dvh bg-grid text-ink">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-5 py-3 lg:px-7">
        <KidsLogo />
        <Link href="/" className="flex items-center gap-2 rounded-control px-3 py-2 font-medium text-ink-muted hover:bg-ink/5 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to CirKit
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Pick a mission</h1>
        <p className="mt-3 max-w-[60ch] text-lg text-ink-muted">First snap real circuits together and make things move. Then give your machine a brain and code it with blocks.</p>

        {PARTS.map(part => (
          <section key={part.kind} className="mt-12" aria-labelledby={`part-${part.kind}`}>
            <h2 id={`part-${part.kind}`} className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{part.title}</h2>
            <p className="mt-2 max-w-[60ch] text-ink-muted">{part.intro}</p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {KIDS_MISSIONS.map((mission, i) => mission.kind === part.kind && (
                <Link
                  key={mission.id}
                  href={`/kids/${mission.id}`}
                  className="group flex flex-col overflow-hidden rounded-panel bg-ink text-white shadow-[0_4px_0_var(--color-ink-dark)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="bg-ink-dark"><CardArt mission={mission} /></div>
                  <div className="flex flex-1 flex-col gap-2 p-6">
                    <span className="text-sm text-white/75">Mission {i + 1}</span>
                    <span className="font-display text-2xl font-semibold tracking-[-0.02em]">{mission.title}</span>
                    <span className="leading-relaxed text-white/85">{mission.story}</span>
                    <span className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-glow">You learn: {mission.learn}</span>
                      <span className="inline-flex h-12 items-center gap-2 rounded-control bg-glow px-5 font-semibold text-ink shadow-[0_3px_0_var(--color-glow-dark)]">
                        <Play className="h-4 w-4" /> Start
                      </span>
                    </span>
                  </div>
                </Link>
              ))}

              <div className="grid content-start gap-4 sm:grid-cols-2">
                {part.coming.map(({ title, learn, icon: Icon }) => (
                  <div key={title} className="flex flex-col gap-2 rounded-card border border-dashed border-line-strong bg-surface p-5">
                    <Icon className="h-8 w-8 text-ink-muted" aria-hidden="true" />
                    <span className="font-display text-lg font-semibold leading-tight tracking-[-0.015em]">{title}</span>
                    <span className="mt-auto text-sm font-medium text-ink-muted">You&apos;ll learn: {learn}</span>
                    <span className="text-xs font-semibold text-carrot-ink">Coming soon</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
