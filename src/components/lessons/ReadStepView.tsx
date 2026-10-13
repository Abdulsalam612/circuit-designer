import Image from "next/image"
import { AlertTriangle, Info, Lightbulb } from "lucide-react"
import type { ContentBlock, ReadStep } from "@/types/lesson"
import { COMPONENT_DEFS, iconFor } from "@/lib/components"
import RichText from "./RichText"

const CALLOUT_STYLE = {
  tip: { box: "bg-amber-50 border-amber-200 text-amber-900", icon: <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" /> },
  warning: { box: "bg-red-50 border-red-200 text-red-900", icon: <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" /> },
  info: { box: "bg-blue-50 border-blue-200 text-blue-900", icon: <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" /> },
}

const Block = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case "text":
      return <p className="text-gray-700 leading-relaxed"><RichText text={block.text} /></p>
    case "list":
      return (
        <ul className="space-y-2 list-disc pl-6 text-gray-700 leading-relaxed">
          {block.items.map((item, i) => <li key={i}><RichText text={item} /></li>)}
        </ul>
      )
    case "callout": {
      const style = CALLOUT_STYLE[block.tone]
      return (
        <div className={`flex gap-3 rounded-lg border px-4 py-3 leading-relaxed ${style.box}`}>
          {style.icon}
          <p><RichText text={block.text} /></p>
        </div>
      )
    }
    case "formula":
      return (
        <div className="rounded-lg bg-[#31393C] text-white px-6 py-5 text-center">
          <p className="text-2xl font-mono font-semibold tracking-wide">{block.text}</p>
          {block.caption && <p className="text-sm text-white/70 mt-1">{block.caption}</p>}
        </div>
      )
    case "parts":
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          {block.parts.map(({ part, text }) => (
            <div key={part} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <div className="w-20 h-8 relative shrink-0">
                <Image src={iconFor({ type: part })} alt={COMPONENT_DEFS[part].label} fill style={{ objectFit: "contain" }} />
              </div>
              <p className="text-sm text-gray-700"><RichText text={text} /></p>
            </div>
          ))}
        </div>
      )
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>{block.headers.map((h, i) => <th key={i} className="px-4 py-2 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t border-gray-100">
                  {row.map((cell, c) => <td key={c} className="px-4 py-2 text-gray-700"><RichText text={cell} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

const ReadStepView = ({ step }: { step: ReadStep }) => (
  <div className="space-y-5">
    {step.blocks.map((block, i) => <Block key={i} block={block} />)}
  </div>
)

export default ReadStepView
