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

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-[#31393C] focus:border-[#2176FF] focus:outline-none focus:ring-2 focus:ring-[#2176FF]/20"
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#2176FF] px-4 py-2 font-medium text-white hover:bg-[#33A1FD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-[#31393C] hover:bg-gray-50 transition-colors disabled:opacity-50"

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
    return <div className="p-8 text-center">{loading ? "Loading..." : "Redirecting..."}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile &amp; settings</h1>
        <Overview user={user} />
        <ProfileSection user={user} />
        <EmailSection user={user} />
        <PasswordSection user={user} />
        <DeleteSection user={user} deletingRef={deletingRef} />
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
    <section className={`rounded-xl border bg-white p-5 sm:p-6 shadow-sm ${danger ? "border-red-200" : "border-gray-200"}`}>
      <h2 className={`text-lg font-semibold ${danger ? "text-red-700" : "text-[#31393C]"}`}>{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-[#31393C] mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
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
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <UserAvatar name={name} avatar={profile?.avatar} size={64} />
        <div className="min-w-0">
          <p className="text-xl font-semibold text-[#31393C] truncate">{name}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          {joined && <p className="text-xs text-gray-400 mt-0.5">Joined {joined}</p>}
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg bg-gray-50 px-3 py-3 text-center">
            <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500">
              <Icon className="h-3.5 w-3.5" /> {label}
            </dt>
            <dd className="mt-1 text-lg font-bold text-[#31393C]">{value}</dd>
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
          {nameError && name !== savedName && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
        </Field>

        <fieldset>
          <legend className="block text-sm font-medium text-[#31393C] mb-2">Avatar</legend>
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
      className={`relative rounded-full p-1 transition-shadow ${selected ? "ring-2 ring-[#2176FF] ring-offset-1" : "hover:ring-2 hover:ring-gray-300"}`}
    >
      {children}
      {selected && (
        <span className="absolute -right-0.5 -bottom-0.5 rounded-full bg-[#2176FF] p-0.5 text-white">
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
        <Mail className="h-4 w-4 text-gray-400" />
        <span className="font-medium text-[#31393C] break-all">{user.email}</span>
        {user.emailVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Not verified</span>
        )}
      </div>

      {!user.emailVerified && (
        <p className="mt-3 text-sm text-gray-600">
          {verificationSent
            ? "Check your inbox for the link (and your spam folder). Reload this page after clicking it."
            : "Verify your email so you can always get back into your account."}{" "}
          {!verificationSent && (
            <button onClick={verify} disabled={busy} className="font-medium text-[#2176FF] hover:underline disabled:opacity-50">
              Send verification email
            </button>
          )}
        </p>
      )}

      {sentTo && (
        <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-[#31393C]">
          We&apos;ve sent a link to <strong className="break-all">{sentTo}</strong>. Your email changes once you click it,
          and you&apos;ll then need to sign in again with the new address.
        </p>
      )}

      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-4 border-t border-gray-100 pt-4">
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
            {tooShort && <p className="mt-1 text-xs text-red-600">Too short.</p>}
          </Field>
          <Field label="Confirm new password" htmlFor="confirm-password">
            <input id="confirm-password" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" className={inputClass} />
            {mismatch && <p className="mt-1 text-xs text-red-600">The passwords don&apos;t match.</p>}
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
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 transition-colors">
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
