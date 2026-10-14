import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"
import { heading } from "@/components/ui/typography"

// Layout for text pages (About, Privacy, Terms). Pages write plain h2/p/ul/a; the styles
// below give them consistent spacing without a typography plugin.

interface InfoPageProps {
  title: string
  intro?: React.ReactNode
  updated?: string
  children: React.ReactNode
}

const prose = [
  "text-ink leading-relaxed",
  "[&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h2]:text-ink [&_h2]:scroll-mt-20",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold",
  "[&_p]:mt-3 [&_p]:text-ink",
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ul]:text-ink",
  "[&_a]:font-medium [&_a]:text-signal [&_a:hover]:underline",
  "[&_strong]:font-semibold [&_strong]:text-ink",
].join(" ")

export default function InfoPage({ title, intro, updated, children }: InfoPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="bg-grid border-b border-line">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className={heading.xl}>{title}</h1>
            {intro && <p className="mt-3 text-lg text-ink-muted">{intro}</p>}
            {updated && <p className="mt-3 text-sm text-ink-faint">Last updated {updated}</p>}
          </div>
        </div>
        <article className={`max-w-3xl mx-auto px-6 pt-2 pb-16 ${prose}`}>{children}</article>
      </main>
      <SiteFooter />
    </div>
  )
}
