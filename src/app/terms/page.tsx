import type { Metadata } from "next"
import Link from "next/link"
import InfoPage from "@/components/InfoPage"
import { CONTACT_EMAIL, ISSUES_URL } from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "Terms of Use – CirKit",
  description: "The rules for using CirKit, and important safety notes.",
}

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Use"
      intro="By using CirKit you agree to these terms. They're written to be read, so please do."
      updated="14 October 2026"
    >
      <h2>Using CirKit</h2>
      <p>
        CirKit is a free tool for learning about electronics. You&apos;re welcome to use it for yourself, at school or
        in a class. Please use it fairly: don&apos;t try to break, overload or get around how the site works, and
        don&apos;t use it to harm other people.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give a real email address, so you can verify it and reset your password.</li>
        <li>Keep your password to yourself. You&apos;re responsible for what happens in your account.</li>
        <li>If you&apos;re under 13, ask a parent, guardian or teacher before creating an account.</li>
        <li>You can delete your account at any time from your <Link href="/profile">Profile</Link>.</li>
      </ul>

      <h2>Your circuits</h2>
      <p>
        The circuits you build are yours. By saving them in CirKit you let us store them so we can show them back to
        you. We don&apos;t share them with anyone else.
      </p>

      <h2>Safety: the simulator is not real life</h2>
      <p>
        CirKit&apos;s simulator is simplified so that it&apos;s easy to learn from. Real components have tolerances,
        heat up, wear out and fail in ways a simulation doesn&apos;t show. So:
      </p>
      <ul>
        <li>Don&apos;t rely on CirKit to design anything where a mistake could cause injury, fire or damage.</li>
        <li><strong>Never work on mains electricity</strong> (household plugs and sockets). It can kill.</li>
        <li>Batteries can get hot, leak or catch fire if they&apos;re short-circuited. Don&apos;t short them, even to test an idea.</li>
        <li>Young learners should build real circuits only with an adult.</li>
      </ul>

      <h2>The service</h2>
      <p>
        We work hard to keep CirKit running and accurate, but it&apos;s provided &ldquo;as is&rdquo;: there may be
        bugs, the simulator may get things wrong, and the site may sometimes be unavailable. We may change, add or
        remove features over time. Keep your own copy (Export) of any circuit that matters to you.
      </p>
      <p>
        We may suspend accounts that break these terms or put the site or other people at risk.
      </p>

      <h2>Responsibility</h2>
      <p>
        As far as the law allows, CirKit and its creator aren&apos;t responsible for losses that come from using the
        site or relying on its results. Nothing in these terms takes away rights you have by law.
      </p>

      <h2>Law</h2>
      <p>
        These terms are governed by the law of England and Wales. If you live elsewhere in the UK, you can also use
        the courts where you live.
      </p>

      <h2>Changes to these terms</h2>
      <p>If we change these terms we&apos;ll update this page and the date at the top.</p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, report a bug on{" "}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">GitHub</a>, or read our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </InfoPage>
  )
}
