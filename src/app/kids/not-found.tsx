import { ArrowLeft } from "lucide-react"
import { KidsLogo } from "@/components/kids/KidsTopBar"
import Button from "@/components/ui/Button"

// A wrong or old mission link: a friendly dead end in Kids style, with one clear way back
export default function KidsNotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-grid text-ink">
      <title>Mission not found – CirKit Kids</title>
      <header className="flex items-center gap-4 border-b border-line bg-surface px-5 py-3 lg:px-7">
        <KidsLogo />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Oops, that mission isn&apos;t here!</h1>
        <p className="mt-3 max-w-[40ch] text-lg text-ink-muted">Maybe the link is wrong. Pick a mission from the map instead.</p>
        <Button variant="glow" size="lg" href="/kids" className="mt-8">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back to missions
        </Button>
      </main>
    </div>
  )
}
