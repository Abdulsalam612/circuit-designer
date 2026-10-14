"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import { notFound, useParams } from "next/navigation"
import { Play } from "lucide-react"
import { KIDS_MISSIONS } from "@/content/kids"
import type { Block, KidsCodeMission } from "@/types/kids"
import KidsTopBar, { type KidsStep } from "@/components/kids/KidsTopBar"
import BuildStep from "@/components/kids/BuildStep"
import PlayStep from "@/components/kids/PlayStep"
import CircuitMission from "@/components/kids/CircuitMission"
import Button from "@/components/ui/Button"

// One CirKit Kids mission (docs/kids-mode-mvp.md). Circuit missions (Part 1) are a snap board;
// code missions (Part 2) are the workbench: Build → Code → Play.
// No account needed and nothing is saved yet (stars and programs are saved in milestone 3).

const BlocklyEditor = dynamic(() => import("@/components/kids/BlocklyEditor"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-ink-muted">Loading the blocks…</div>,
})

export default function KidsMissionPage() {
  const { missionId } = useParams<{ missionId: string }>()
  const index = KIDS_MISSIONS.findIndex(m => m.id === missionId)
  if (index === -1) notFound()
  const mission = KIDS_MISSIONS[index]
  const next = KIDS_MISSIONS[index + 1]
  // Keyed by mission so moving to another mission starts fresh
  if (mission.kind === "circuit") {
    return <CircuitMission key={mission.id} mission={mission} missionNumber={index + 1} next={next && { id: next.id, title: next.title }} />
  }
  return <Workbench key={mission.id} mission={mission} missionNumber={index + 1} />
}

function Workbench({ mission, missionNumber }: { mission: KidsCodeMission; missionNumber: number }) {
  const [step, setStep] = useState<KidsStep>("build")
  const [placed, setPlaced] = useState<ReadonlySet<string>>(new Set())
  const [program, setProgram] = useState<Block[]>(mission.startProgram)
  const [stars, setStars] = useState(0)

  const place = (id: string) => setPlaced(prev => new Set(prev).add(id))
  const onProgramChange = useCallback((next: Block[]) => setProgram(next), [])

  return (
    <div className="flex h-dvh flex-col bg-grid text-ink">
      <title>{`${mission.title} – CirKit Kids`}</title>
      <KidsTopBar missionNumber={missionNumber} missionTitle={mission.title} step={step} onStep={setStep} stars={stars} />

      {step === "build" && <BuildStep mission={mission} placed={placed} onPlace={place} onNext={() => setStep("code")} />}

      {step === "code" && (
        <div className="flex min-h-0 flex-1 flex-col gap-5 p-5 lg:flex-row lg:p-7">
          <section className="min-h-[420px] min-w-0 flex-1 overflow-hidden rounded-panel border border-line bg-surface shadow-key" aria-label="Your program">
            {/* Opens with the current program, so switching steps never loses work */}
            <BlocklyEditor blocks={mission.blocks} initial={program} onChange={onProgramChange} />
          </section>
          <aside className="flex shrink-0 flex-col gap-4 lg:w-72">
            <div className="rounded-card bg-ink p-5 text-white shadow-[0_3px_0_var(--color-ink-dark)]">
              <p className="text-sm text-white/75">Your mission</p>
              <h2 className="mt-1.5 font-display text-xl font-semibold leading-tight tracking-[-0.015em]">{mission.title}</h2>
              <p className="mt-2.5 leading-relaxed text-white/90">{mission.brief}</p>
            </div>
            <div className="rounded-card border border-glow-dark/40 bg-glow-tint p-4 leading-relaxed">
              <strong className="font-semibold">Hint:</strong> {mission.hint}
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              Drag blocks from the left and snap them under <strong className="font-semibold text-ink">when Go is pressed</strong>. Blocks that aren&apos;t joined on turn grey and don&apos;t run.
            </p>
            <Button size="lg" onClick={() => setStep("play")}>
              <Play className="h-5 w-5" /> Try it on the track
            </Button>
          </aside>
        </div>
      )}

      {step === "play" && (
        <PlayStep
          mission={mission}
          placed={placed}
          program={program}
          onSuccess={() => setStars(3)}
          onEditCode={() => setStep("code")}
        />
      )}
    </div>
  )
}
