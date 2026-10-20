import type { ThingKind } from "@/types/kids"

// The everyday things of "Does it conduct?", shared by the board, the tray, the findings and
// the mission map.
// Each thing drawn lying along x, centred, about one gap (84) long so it touches both studs
export default function ThingShape({ kind }: { kind: ThingKind }) {
  switch (kind) {
    case "coin":
      return (
        <g>
          <circle r={31} fill="#E0A526" stroke="#9A6A0A" strokeWidth={3} />
          <circle r={22} fill="none" stroke="#9A6A0A" strokeWidth={1.5} strokeOpacity={0.6} />
        </g>
      )
    case "key":
      return (
        <g fill="#B8C4D4" stroke="#5B666B" strokeWidth={2.5} strokeLinejoin="round">
          <circle cx={-22} r={18} />
          <circle cx={-22} r={6} fill="#DCE7F9" />
          <path d="M-5 -6 H38 V6 H30 V14 H22 V6 H-5 Z" />
        </g>
      )
    case "clip":
      return (
        <path
          d="M-36 6 V-8 A10 10 0 0 1 -16 -8 H30 A10 10 0 0 1 30 12 H-24 A6 6 0 0 1 -24 0 H24"
          fill="none" stroke="#7D8A91" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
        />
      )
    case "eraser":
      return (
        <g>
          <rect x={-36} y={-18} width={72} height={36} rx={8} fill="#F49AC1" stroke="#B5487A" strokeWidth={2.5} />
          <rect x={4} y={-16.5} width={30.5} height={33} fill="#2176FF" fillOpacity={0.85} />
        </g>
      )
    case "stick":
      return <rect x={-38} y={-9} width={76} height={18} rx={9} fill="#E6C48A" stroke="#A9814A" strokeWidth={2.5} />
    case "spoon":
      return (
        <g fill="#8AB4F8" stroke="#1048A8" strokeWidth={2.5}>
          <rect x={-38} y={-5} width={46} height={10} rx={5} />
          <ellipse cx={22} rx={18} ry={14} />
        </g>
      )
  }
}
