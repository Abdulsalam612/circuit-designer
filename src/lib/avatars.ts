import { Atom, Battery, Cpu, Lightbulb, Magnet, Plug, Radio, Zap, type LucideIcon } from "lucide-react"

// Preset avatars (electronics icons on a brand colour). Picked on the profile page and stored
// as `avatar: <id>` on users/{uid}. Presets instead of photo uploads: no Firebase Storage
// needed, nothing to moderate, and they suit a learning app for kids too.
// Ids are stored, so never rename one. Backgrounds can change: each keeps the white icon at
// 4.5:1 or better (bolt, bulb, battery and radio were darkened in Nov 2026 for that).

export interface AvatarOption {
  id: string
  label: string
  icon: LucideIcon
  background: string
}

export const AVATARS: AvatarOption[] = [
  { id: "bolt", label: "Lightning bolt", icon: Zap, background: "#1A66E8" },
  { id: "bulb", label: "Light bulb", icon: Lightbulb, background: "#C2410C" },
  { id: "battery", label: "Battery", icon: Battery, background: "#15803D" },
  { id: "chip", label: "Microchip", icon: Cpu, background: "#31393C" },
  { id: "atom", label: "Atom", icon: Atom, background: "#7C3AED" },
  { id: "magnet", label: "Magnet", icon: Magnet, background: "#DC2626" },
  { id: "radio", label: "Radio", icon: Radio, background: "#0E7490" },
  { id: "plug", label: "Plug", icon: Plug, background: "#DB2777" },
]

export const findAvatar = (id: string | null | undefined) => AVATARS.find(a => a.id === id) ?? null
