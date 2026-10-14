"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { User } from "firebase/auth"
import { AlertTriangle, Award, BookOpen, Check, Loader2, Mail, ShieldCheck, Zap } from "lucide-react"
import SiteHeader from "@/components/SiteHeader"
import UserAvatar from "@/components/UserAvatar"
import ConfirmDialog from "@/components/ConfirmDialog"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { AVATARS } from "@/lib/avatars"
import { LESSONS } from "@/content/lessons"
import { loadProgress, type LearningProgress } from "@/lib/progress"
import {
  MAX_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  changeEmail,
  changePassword,
  deleteAccount,
  saveProfile,
  sendVerification,
} from "@/lib/account"
import { friendlyAccountError } from "@/lib/authErrors"
import { buttonClass } from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { inputClass } from "@/components/ui/Field"
import { heading } from "@/components/ui/typography"

const primaryButton = buttonClass("primary")
const secondaryButton = buttonClass("secondary")

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  // Like useRequireAuth, but not after deleting the account (that signs out too, and should
  // land on the home page, not the login box)
  const deletingRef = useRef(false)

  useEffect(() => {
    if (!loading && !user && !deletingRef.current) {
      router.replace(`/?login=1&next=${encodeURIComponent(pathname)}`)
    }
  }, [loading, user, router, pathname])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-grid">
        <SiteHeader />
        <p className="p-16 text-center text-ink-muted" role="status">{loading ? "Loading…" : "Redirecting to sign in…"}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grid">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
        <h1 className={`${heading.xl} pt-12 pb-8`}>Profile &amp; settings</h1>
        {/* Overview stays in view on desktop while the settings scroll */}
        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-20">
            <Overview user={user} />
          </div>
          <div className="space-y-6">
            <ProfileSection user={user} />
            <EmailSection user={user} />
            <PasswordSection user={user} />
            <DeleteSection user={user} deletingRef={deletingRef} />
          </div>
        </div>
      </main>
    </div>
  )
}

function Card({ title, description, children, danger = false }: {
  title: string
  description?: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <section className={`rounded-panel border bg-surface p-5 sm:p-7 ${danger ? "border-danger/30" : "border-line"}`}>
      <h2 className={`${heading.md} ${danger ? "text-danger" : ""}`}>{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-sm text-ink-muted">{hint}</p>}
    </div>
  )
}

const formatJoined = (user: User) => {
  const created = user.metadata.creationTime ? new Date(user.metadata.creationTime) : null
  return created ? created.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : null
}

// Avatar, name, email, join date and learning stats
function Overview({ user }: { user: User }) {
  const { profile } = useAuth()
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const name = profile?.name || user.displayName || user.email || ""
  const joined = formatJoined(user)

  useEffect(() => {
    loadProgress(user.uid).then(setProgress).catch(() => setProgress(null))
  }, [user.uid])

  const stats = [
    { icon: Zap, label: "Level", value: progress ? progress.level : "–" },
    { icon: Award, label: "Points", value: progress ? progress.totalPoints : "–" },
    { icon: BookOpen, label: "Lessons", value: progress ? `${progress.completedLessons.length}/${LESSONS.length}` : "–" },
  ]

  return (
    <section className="rounded-panel border border-line bg-surface p-6 shadow-key">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <UserAvatar name={name} avatar={profile?.avatar} size={64} />
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold tracking-[-0.01em] text-ink">{name}</p>
          <p className="truncate text-sm text-ink-muted">{user.email}</p>
          {joined && <p className="mt-0.5 text-xs text-ink-muted">Joined {joined}</p>}
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-control bg-paper px-2 py-3 text-center">
            <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-ink-muted">
              <Icon className="h-3.5 w-3.5" /> {label}
            </dt>
            <dd className="tabular mt-1 font-display text-lg font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

// Display name + avatar, saved together
function ProfileSection({ user }: { user: User }) {
  const { profile } = useAuth()
  const toast = useToast()
  const savedName = profile?.name || user.displayName || ""
  const savedAvatar = profile?.avatar ?? null
  const [name, setName] = useState(savedName)
  const [avatar, setAvatar] = useState<string | null>(savedAvatar)
  const [saving, setSaving] = useState(false)

  // The profile doc arrives after the first render; take its values until the user edits
  const touched = useRef(false)
  useEffect(() => {
    if (touched.current) return
    setName(savedName)
    setAvatar(savedAvatar)
  }, [savedName, savedAvatar])

  const trimmed = name.trim()
  const changed = trimmed !== savedName || avatar !== savedAvatar
  const nameError = !trimmed ? "Please enter a name." : trimmed.length > MAX_NAME_LENGTH ? `Keep it under ${MAX_NAME_LENGTH} characters.` : null

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nameError || !changed) return
    setSaving(true)
    try {
      await saveProfile(user, {
        ...(trimmed !== savedName ? { name: trimmed } : {}),
        ...(avatar !== savedAvatar ? { avatar } : {}),
      })
      touched.current = false
      toast.success("Profile saved.")
    } catch {
      toast.error("Couldn't save your profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Profile" description="How you appear in CirKit.">
      <form onSubmit={save} className="space-y-5">
        <Field label="Display name" htmlFor="profile-name">
          <input
            id="profile-name"
            value={name}
            onChange={e => { touched.current = true; setName(e.target.value) }}
            maxLength={MAX_NAME_LENGTH + 10}
            autoComplete="name"
            className={inputClass}
          />
          {nameError && name !== savedName && <p className="mt-1.5 text-sm text-danger">{nameError}</p>}
        </Field>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-ink">Avatar</legend>
          <div className="flex flex-wrap gap-2">
            <AvatarChoice selected={avatar === null} label="Initials" onSelect={() => { touched.current = true; setAvatar(null) }}>
              <UserAvatar name={trimmed || savedName} avatar={null} size={44} />
            </AvatarChoice>
            {AVATARS.map(option => (
              <AvatarChoice
                key={option.id}
                selected={avatar === option.id}
                label={option.label}
                onSelect={() => { touched.current = true; setAvatar(option.id) }}
              >
                <UserAvatar name="" avatar={option.id} size={44} />
              </AvatarChoice>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={!changed || !!nameError || saving} className={primaryButton}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </button>
      </form>
    </Card>
  )
}

function AvatarChoice({ selected, label, onSelect, children }: {
  selected: boolean
  label: string
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={`relative rounded-full p-1 transition-shadow ${selected ? "ring-2 ring-signal ring-offset-1" : "hover:ring-2 hover:ring-line-strong"}`}
    >
      {children}
      {selected && (
        <span className="absolute -right-0.5 -bottom-0.5 rounded-full bg-signal p-0.5 text-white">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  )
}

function EmailSection({ user }: { user: User }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)

  const verify = async () => {
    setBusy(true)
    try {
      await sendVerification(user)
      setVerificationSent(true)
      toast.success(`Verification email sent to ${user.email}.`)
    } catch (e) {
      toast.error(friendlyAccountError(e, "Couldn't send the email. Please try again."))
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = newEmail.trim()
    if (email.toLowerCase() === user.email?.toLowerCase()) {
      toast.error("That's already your email address.")
      return
    }
    setBusy(true)
    try {
      await changeEmail(user, password, email)
      setSentTo(email)
      setOpen(false)
      setNewEmail("")
      setPassword("")
    } catch (err) {
      toast.error(friendlyAccountError(err, "Couldn't change your email. Please try again."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Email">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Mail className="h-4 w-4 text-ink-faint" />
        <span className="break-all font-medium text-ink">{user.email}</span>
        {user.emailVerified ? (
          <Badge tone="success" icon={<ShieldCheck className="h-3.5 w-3.5" />}>Verified</Badge>
        ) : (
          <Badge tone="warning">Not verified</Badge>
        )}
      </div>

      {!user.emailVerified && (
        <p className="mt-3 text-sm text-ink-muted">
          {verificationSent
            ? "Check your inbox for the link (and your spam folder). Reload this page after clicking it."
            : "Verify your email so you can always get back into your account."}{" "}
          {!verificationSent && (
            <button onClick={verify} disabled={busy} className="font-medium text-signal hover:underline disabled:opacity-50">
              Send verification email
            </button>
          )}
        </p>
      )}

      {sentTo && (
        <p className="mt-3 rounded-control border border-signal/25 bg-signal-tint px-3 py-2.5 text-sm text-ink" role="status">
          We&apos;ve sent a link to <strong className="break-all">{sentTo}</strong>. Your email changes once you click it,
          and you&apos;ll then need to sign in again with the new address.
        </p>
      )}

      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-4 border-t border-line pt-4">
          <Field label="New email" htmlFor="new-email">
            <input id="new-email" type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} autoComplete="email" className={inputClass} />
          </Field>
          <Field label="Current password" htmlFor="email-password" hint="To keep your account safe, confirm it's you.">
            <input id="email-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" className={inputClass} />
          </Field>
          <div className="flex gap-2">
            <button type="submit" disabled={busy || !newEmail.trim() || !password} className={primaryButton}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Send confirmation link
            </button>
            <button type="button" onClick={() => setOpen(false)} className={secondaryButton}>Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className={`${secondaryButton} mt-4`}>Change email</button>
      )}
    </Card>
  )
}

function PasswordSection({ user }: { user: User }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)

  const tooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH
  const mismatch = confirm.length > 0 && next !== confirm
  const ready = current && next.length >= MIN_PASSWORD_LENGTH && next === confirm

  const close = () => {
    setOpen(false)
    setCurrent("")
    setNext("")
    setConfirm("")
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return
    setBusy(true)
    try {
      await changePassword(user, current, next)
      toast.success("Password changed.")
      close()
    } catch (err) {
      toast.error(friendlyAccountError(err, "Couldn't change your password. Please try again."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Password">
      {open ? (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Current password" htmlFor="current-password">
            <input id="current-password" type="password" required value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" className={inputClass} />
          </Field>
          <Field label="New password" htmlFor="new-password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
            <input id="new-password" type="password" required value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" className={inputClass} />
            {tooShort && <p className="mt-1.5 text-sm text-danger">Too short.</p>}
          </Field>
          <Field label="Confirm new password" htmlFor="confirm-password">
            <input id="confirm-password" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" className={inputClass} />
            {mismatch && <p className="mt-1.5 text-sm text-danger">The passwords don&apos;t match.</p>}
          </Field>
          <div className="flex gap-2">
            <button type="submit" disabled={busy || !ready} className={primaryButton}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Change password
            </button>
            <button type="button" onClick={close} className={secondaryButton}>Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className={secondaryButton}>Change password</button>
      )}
    </Card>
  )
}

function DeleteSection({ user, deletingRef }: { user: User; deletingRef: React.RefObject<boolean> }) {
  const toast = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  const cancel = () => {
    if (busy) return
    setOpen(false)
    setPassword("")
  }

  const confirmDelete = async () => {
    if (!password || busy) return
    setBusy(true)
    deletingRef.current = true
    try {
      await deleteAccount(user, password)
      toast.info("Your account and all your data have been deleted.")
      router.replace("/")
    } catch (err) {
      deletingRef.current = false
      toast.error(friendlyAccountError(err, "Couldn't delete your account. Please try again."))
      setBusy(false)
    }
  }

  return (
    <Card title="Delete account" description="Permanently delete your account, saved circuits and learning progress." danger>
      <button onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-control border border-danger/40 px-5 font-medium text-danger transition-colors hover:bg-danger-tint">
        <AlertTriangle className="h-4 w-4" />
        Delete my account
      </button>

      <ConfirmDialog
        open={open}
        title="Delete your account?"
        message="This deletes your account, all your saved circuits and your progress. It can't be undone."
        confirmLabel={busy ? "Deleting…" : "Delete account"}
        danger
        confirmDisabled={!password || busy}
        onCancel={cancel}
        onConfirm={confirmDelete}
      >
        <form onSubmit={e => { e.preventDefault(); confirmDelete() }}>
          <Field label="Enter your password to confirm" htmlFor="delete-password">
            <input
              id="delete-password"
              type="password"
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </Field>
        </form>
      </ConfirmDialog>
    </Card>
  )
}
