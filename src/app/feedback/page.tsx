"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Bug, CheckCircle2, HelpCircle, Lightbulb, Loader2, MessageSquare, type LucideIcon } from "lucide-react"
import SiteHeader from "@/components/SiteHeader"
import SiteFooter, { CONTACT_EMAIL } from "@/components/SiteFooter"
import { useAuth } from "@/context/AuthContext"
import { buttonClass } from "@/components/ui/Button"
import { inputClass } from "@/components/ui/Field"
import { heading, text } from "@/components/ui/typography"
import { useToast } from "@/context/ToastContext"
import {
  MAX_EMAIL_LENGTH,
  MAX_MESSAGE_LENGTH,
  isFeedbackType,
  submitFeedback,
  type FeedbackType,
} from "@/lib/feedback"

const TYPES: { id: FeedbackType; label: string; icon: LucideIcon; placeholder: string }[] = [
  {
    id: "bug",
    label: "Something's broken",
    icon: Bug,
    placeholder: "What happened, and what did you expect to happen? The steps to make it happen again help a lot.",
  },
  { id: "idea", label: "Idea", icon: Lightbulb, placeholder: "What would make CirKit better for you?" },
  { id: "question", label: "Question", icon: HelpCircle, placeholder: "What would you like to know?" },
  { id: "other", label: "Something else", icon: MessageSquare, placeholder: "What's on your mind?" },
]

// Only same-site paths, e.g. "/simulation" (from ?from=, set by the error page)
const safePath = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : undefined


export default function FeedbackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <title>Send feedback – CirKit</title>
      <SiteHeader />
      <main className="flex-1 bg-grid">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <h1 className={heading.xl}>Send feedback</h1>
          <p className={`${text.lead} mt-3`}>
            Found a bug, got an idea or stuck on something? Tell us – every message is read.
          </p>
          {/* useSearchParams needs a Suspense boundary for static rendering */}
          <Suspense fallback={<div className="mt-8 h-96 rounded-panel border border-line bg-surface" />}>
            <FeedbackForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function FeedbackForm() {
  const { user } = useAuth()
  const toast = useToast()
  const params = useSearchParams()
  const requestedType = params.get("type")
  const fromPage = safePath(params.get("from"))

  const [type, setType] = useState<FeedbackType>(isFeedbackType(requestedType) ? requestedType : "bug")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [includeDetails, setIncludeDetails] = useState(true)
  // Hidden from people; bots that fill every field give themselves away
  const [website, setWebsite] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)

  // Signed in: offer the account email for a reply (they can clear it)
  const accountEmail = user?.email ?? ""
  useEffect(() => {
    if (accountEmail) setEmail(current => current || accountEmail)
  }, [accountEmail])

  const trimmed = message.trim()
  const current = TYPES.find(t => t.id === type) ?? TYPES[0]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trimmed || sending) return
    if (website) {
      setSent(true)
      return
    }
    setSending(true)
    setFailed(false)
    try {
      const details = type === "bug" && includeDetails
      await submitFeedback({
        type,
        message: trimmed,
        email,
        uid: user?.uid,
        page: details ? fromPage : undefined,
        userAgent: details ? navigator.userAgent : undefined,
      })
      setSent(true)
    } catch {
      setFailed(true)
      toast.error("Sorry, your message couldn't be sent.")
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setMessage("")
    setSent(false)
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-panel border border-line bg-surface p-8 text-center shadow-sm" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h2 className={`${heading.lg} mt-4`}>Thanks – message received!</h2>
        <p className="mt-2 text-ink-muted">
          {email.trim() ? "If it needs an answer, we'll reply by email." : "Thanks for helping make CirKit better."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className={buttonClass("secondary")}>
            Send another
          </button>
          <Link href="/" className={buttonClass("primary")}>
            Back to CirKit
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-6 rounded-panel border border-line bg-surface p-5 sm:p-6 shadow-sm">
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink">What&apos;s it about?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map(({ id, label, icon: Icon }) => (
            <label
              key={id}
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-control border px-2 py-3 text-center text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-signal/40 ${
                type === id ? "border-signal bg-signal-tint text-signal-dark shadow-[0_2px_0_var(--color-signal)]" : "border-line text-ink-muted hover:bg-paper"
              }`}
            >
              <input type="radio" name="type" value={id} checked={type === id} onChange={() => setType(id)} className="sr-only" />
              <Icon className="h-5 w-5" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="feedback-message" className="mb-1 block text-sm font-medium text-ink">Your message</label>
        <textarea
          id="feedback-message"
          required
          rows={6}
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={current.placeholder}
          className={`${inputClass} resize-y`}
        />
        <p className={`mt-1 text-right text-xs ${message.length > MAX_MESSAGE_LENGTH * 0.9 ? "text-carrot-ink" : "text-ink-muted"}`}>
          {message.length}/{MAX_MESSAGE_LENGTH}
        </p>
      </div>

      <div>
        <label htmlFor="feedback-email" className="mb-1 block text-sm font-medium text-ink">
          Email <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          maxLength={MAX_EMAIL_LENGTH}
          autoComplete="email"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-ink-muted">Only if you&apos;d like a reply.</p>
      </div>

      {type === "bug" && (
        <label className="flex items-start gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={includeDetails}
            onChange={e => setIncludeDetails(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line-strong accent-signal"
          />
          <span>
            Include technical details to help us fix it: your browser{fromPage ? <> and the page you were on (<code>{fromPage}</code>)</> : null}.
          </span>
        </label>
      )}

      {/* Honeypot: off-screen and skipped by keyboard and screen readers */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="feedback-website">Website</label>
        <input id="feedback-website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      {failed && (
        <p className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger" role="alert">
          Please try again in a moment, or email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">{CONTACT_EMAIL}</a>.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">
          We only use this to read and reply to your message. <Link href="/privacy" className="text-signal hover:underline">Privacy Policy</Link>
        </p>
        <button
          type="submit"
          disabled={!trimmed || sending}
          className={buttonClass("primary")}
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send
        </button>
      </div>
    </form>
  )
}
