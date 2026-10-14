"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Bug, CheckCircle2, HelpCircle, Lightbulb, Loader2, MessageSquare, type LucideIcon } from "lucide-react"
import SiteHeader from "@/components/SiteHeader"
import SiteFooter, { CONTACT_EMAIL } from "@/components/SiteFooter"
import { useAuth } from "@/context/AuthContext"
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

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-[#31393C] focus:border-[#2176FF] focus:outline-none focus:ring-2 focus:ring-[#2176FF]/20"

export default function FeedbackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <title>Send feedback – CirKit</title>
      <SiteHeader />
      <main className="flex-1 bg-gradient-to-br from-[#33A1FD]/10 to-[#FDCA40]/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#31393C]">Send feedback</h1>
          <p className="mt-3 text-lg text-gray-600">
            Found a bug, got an idea or stuck on something? Tell us – every message is read.
          </p>
          {/* useSearchParams needs a Suspense boundary for static rendering */}
          <Suspense fallback={<div className="mt-8 h-96 rounded-xl border border-gray-200 bg-white" />}>
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
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="mt-4 text-xl font-semibold text-[#31393C]">Thanks – message received!</h2>
        <p className="mt-2 text-gray-600">
          {email.trim() ? "If it needs an answer, we'll reply by email." : "Thanks for helping make CirKit better."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-[#31393C] hover:bg-gray-50">
            Send another
          </button>
          <Link href="/" className="rounded-lg bg-[#2176FF] px-4 py-2 font-medium text-white hover:bg-[#33A1FD]">
            Back to CirKit
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#31393C]">What&apos;s it about?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map(({ id, label, icon: Icon }) => (
            <label
              key={id}
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2176FF]/40 ${
                type === id ? "border-[#2176FF] bg-[#2176FF]/5 text-[#2176FF]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
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
        <label htmlFor="feedback-message" className="mb-1 block text-sm font-medium text-[#31393C]">Your message</label>
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
        <p className={`mt-1 text-right text-xs ${message.length > MAX_MESSAGE_LENGTH * 0.9 ? "text-amber-600" : "text-gray-400"}`}>
          {message.length}/{MAX_MESSAGE_LENGTH}
        </p>
      </div>

      <div>
        <label htmlFor="feedback-email" className="mb-1 block text-sm font-medium text-[#31393C]">
          Email <span className="font-normal text-gray-400">(optional)</span>
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
        <p className="mt-1 text-xs text-gray-500">Only if you&apos;d like a reply.</p>
      </div>

      {type === "bug" && (
        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={includeDetails}
            onChange={e => setIncludeDetails(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2176FF]"
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
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Please try again in a moment, or email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">{CONTACT_EMAIL}</a>.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          We only use this to read and reply to your message. <Link href="/privacy" className="text-[#2176FF] hover:underline">Privacy Policy</Link>
        </p>
        <button
          type="submit"
          disabled={!trimmed || sending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2176FF] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#33A1FD] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send
        </button>
      </div>
    </form>
  )
}
