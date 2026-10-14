import { Atom, Battery, Cpu, Lightbulb, Magnet, Plug, Radio, Zap, type LucideIcon } from "lucide-react"

// Preset avatars (electronics icons on a brand colour). Picked on the profile page and stored
// as `avatar: <id>` on users/{uid}. Presets instead of photo uploads: no Firebase Storage
// needed, nothing to moderate, and they suit a learning app for kids too.
// Ids are stored, so never rename one.

export interface AvatarOption {
  id: string
  label: string
  icon: LucideIcon
  background: string
}

export const AVATARS: AvatarOption[] = [
  { id: "bolt", label: "Lightning bolt", icon: Zap, background: "#2176FF" },
  { id: "bulb", label: "Light bulb", icon: Lightbulb, background: "#F79824" },
  { id: "battery", label: "Battery", icon: Battery, background: "#16A34A" },
  { id: "chip", label: "Microchip", icon: Cpu, background: "#31393C" },
  { id: "atom", label: "Atom", icon: Atom, background: "#7C3AED" },
  { id: "magnet", label: "Magnet", icon: Magnet, background: "#DC2626" },
  { id: "radio", label: "Radio", icon: Radio, background: "#0891B2" },
  { id: "plug", label: "Plug", icon: Plug, background: "#DB2777" },
]

export const findAvatar = (id: string | null | undefined) => AVATARS.find(a => a.id === id) ?? null
