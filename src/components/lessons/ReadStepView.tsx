import Image from "next/image"
import { AlertTriangle, Info, Lightbulb } from "lucide-react"
import type { ContentBlock, ReadStep } from "@/types/lesson"
import { COMPONENT_DEFS, iconFor } from "@/lib/components"
import RichText from "./RichText"

// Lesson reading. Body text is a touch larger than the rest of the site (17-18 px) with
// a comfortable line length: this is where learners spend their time.

const CALLOUT_STYLE = {
  tip: { box: "bg-glow-tint border-glow-dark/40", label: "Tip", icon: <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-carrot-ink" /> },
  warning: { box: "bg-danger-tint border-danger/30", label: "Careful", icon: <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" /> },
  info: { box: "bg-signal-tint border-signal/25", label: "Note", icon: <Info className="mt-0.5 h-5 w-5 shrink-0 text-signal" /> },
}

const Block = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case "text":
      return <p className="max-w-[68ch] text-[17px] leading-relaxed text-ink sm:text-lg"><RichText text={block.text} /></p>
    case "list":
      return (
        <ul className="max-w-[68ch] list-disc space-y-2 pl-6 text-[17px] leading-relaxed text-ink marker:text-brand sm:text-lg">
          {block.items.map((item, i) => <li key={i}><RichText text={item} /></li>)}
        </ul>
      )
    case "callout": {
      const style = CALLOUT_STYLE[block.tone]
      return (
        <div className={`flex max-w-[68ch] gap-3 rounded-card border px-4 py-3.5 leading-relaxed text-ink ${style.box}`}>
          {style.icon}
          <p>
            <span className="sr-only">{style.label}: </span>
            <RichText text={block.text} />
          </p>
        </div>
      )
    }
    case "formula":
      return (
        <div className="rounded-card bg-ink px-6 py-6 text-center text-white shadow-[0_3px_0_var(--color-ink-dark)]">
          <p className="font-display text-2xl font-semibold tracking-[0.01em] sm:text-3xl">{block.text}</p>
          {block.caption && <p className="mt-2 text-sm text-white/75">{block.caption}</p>}
        </div>
      )
    case "parts":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {block.parts.map(({ part, text }) => (
            <div key={part} className="flex items-center gap-4 rounded-card border border-line bg-surface p-3.5 shadow-key">
              <div className="relative h-9 w-24 shrink-0 rounded-control bg-paper">
                <Image src={iconFor({ type: part })} alt={COMPONENT_DEFS[part].label} fill style={{ objectFit: "contain" }} />
              </div>
              <p className="text-sm leading-normal text-ink"><RichText text={text} /></p>
            </div>
          ))}
        </div>
      )
    case "table":
      return (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-paper text-ink-muted">
              <tr>{block.headers.map((h, i) => <th key={i} className="px-4 py-2.5 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="tabular">
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t border-line">
                  {row.map((cell, c) => <td key={c} className="px-4 py-2.5 text-ink"><RichText text={cell} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

const ReadStepView = ({ step }: { step: ReadStep }) => (
  <div className="space-y-6">
    {step.blocks.map((block, i) => <Block key={i} block={block} />)}
  </div>
)

export default ReadStepView
