import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"

// Layout for text pages (About, Privacy, Terms). Pages write plain h2/p/ul/a; the styles
// below give them consistent spacing without a typography plugin.

interface InfoPageProps {
  title: string
  intro?: React.ReactNode
  updated?: string
  children: React.ReactNode
}

const prose = [
  "text-[#31393C] leading-relaxed",
  "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#31393C] [&_h2]:scroll-mt-20",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold",
  "[&_p]:mt-3 [&_p]:text-gray-700",
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ul]:text-gray-700",
  "[&_a]:font-medium [&_a]:text-[#2176FF] [&_a:hover]:underline",
  "[&_strong]:font-semibold [&_strong]:text-[#31393C]",
].join(" ")

export default function InfoPage({ title, intro, updated, children }: InfoPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-[#33A1FD]/10 to-[#FDCA40]/5 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#31393C]">{title}</h1>
            {intro && <p className="mt-3 text-lg text-gray-600">{intro}</p>}
            {updated && <p className="mt-3 text-sm text-gray-400">Last updated {updated}</p>}
          </div>
        </div>
        <article className={`max-w-3xl mx-auto px-6 pt-2 pb-16 ${prose}`}>{children}</article>
      </main>
      <SiteFooter />
    </div>
  )
}
