import { findAvatar } from "@/lib/avatars"

// The user's chosen preset avatar, or their initials on blue if they haven't picked one

const initialsOf = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("")

interface UserAvatarProps {
  name: string
  avatar?: string | null
  size?: number // px
}

export default function UserAvatar({ name, avatar, size = 36 }: UserAvatarProps) {
  const preset = findAvatar(avatar)
  const style = { width: size, height: size, background: preset?.background ?? "#33A1FD" }
  return (
    <span
      style={style}
      className="shrink-0 rounded-full text-white font-semibold flex items-center justify-center select-none"
      aria-hidden="true"
    >
      {preset ? (
        <preset.icon style={{ width: size * 0.5, height: size * 0.5 }} />
      ) : (
        <span style={{ fontSize: size * 0.38 }}>{initialsOf(name) || "?"}</span>
      )}
    </span>
  )
}
