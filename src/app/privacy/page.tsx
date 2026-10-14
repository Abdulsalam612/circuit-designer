import type { Metadata } from "next"
import Link from "next/link"
import InfoPage from "@/components/InfoPage"
import { CONTACT_EMAIL } from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "Privacy Policy – CirKit",
  description: "What data CirKit stores, why, and how to delete it.",
}

// Keep this in step with the code: what signup writes (app/page.tsx), the profile doc
// (lib/progress.ts, lib/account.ts), saved circuits (lib/circuitStore.ts). If you add
// analytics, cookies or a new service, update this page.

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro="The short version: we only keep what CirKit needs to work, we don't track you, and you can delete everything yourself at any time."
      updated="14 October 2026"
    >
      <h2>Who we are</h2>
      <p>
        CirKit is run by Abdulsalam Sami, based in the United Kingdom, who is responsible for your data (the
        &ldquo;controller&rdquo; under UK data protection law). Contact:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>What we store</h2>
      <h3>If you just look around</h3>
      <p>
        You can read the site and play in CirKit Kids without an account. We don&apos;t store anything about you,
        and there are no analytics, advertising or tracking cookies.
      </p>

      <h3>If you create an account</h3>
      <ul>
        <li><strong>Your name, email address and password.</strong> Passwords are handled by Firebase Authentication (Google) and are never visible to us.</li>
        <li><strong>Your profile:</strong> the avatar you pick, when you joined, and your learning progress: completed lessons, points and level.</li>
        <li><strong>The circuits you save</strong>, with their names and when they were last changed.</li>
      </ul>
      <p>
        We use this only to run CirKit for you: signing you in, saving your work and keeping track of your lessons.
        Our legal reason for this is that it&apos;s needed to provide the service you signed up for.
      </p>

      <h2>Who else handles it</h2>
      <p>CirKit uses two services to run. They process data for us under their own privacy terms:</p>
      <ul>
        <li>
          <strong>Google Firebase</strong> stores your account, profile and circuits, and sends account emails
          (verification and password reset). <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase privacy information</a>.
        </li>
        <li>
          <strong>Vercel</strong> hosts the website. Like any web host, it handles basic request information (such as
          your IP address and browser type) to deliver pages and keep the site secure.{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel privacy policy</a>.
        </li>
      </ul>
      <p>We never sell your data or share it for advertising.</p>

      <h2>Cookies and browser storage</h2>
      <p>
        We don&apos;t use cookies for tracking. When you sign in, Firebase keeps a small sign-in record in your
        browser&apos;s storage so you stay logged in. Logging out removes it.
      </p>

      <h2>Your rights and choices</h2>
      <p>
        Under UK data protection law you can ask for a copy of your data, have it corrected or deleted, or object to
        how it&apos;s used. Most of this you can do yourself:
      </p>
      <ul>
        <li><strong>See and change your details</strong> on your <Link href="/profile">Profile</Link> page (name, avatar, email, password).</li>
        <li><strong>Download a circuit</strong> at any time with Export in the Circuit Editor.</li>
        <li>
          <strong>Delete everything:</strong> Profile → Delete account removes your account, profile, progress and
          every saved circuit straight away. This can&apos;t be undone.
        </li>
      </ul>

      <p>
        For anything else, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you&apos;re unhappy
        with how we handle your data, you can complain to the Information Commissioner&apos;s Office at{" "}
        <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
      </p>

      <h2>How long we keep it</h2>
      <p>Until you delete it. Deleting a circuit removes it; deleting your account removes all of your data.</p>

      <h2>Children</h2>
      <p>
        CirKit is made for learners of all ages. CirKit Kids doesn&apos;t need an account. If you&apos;re under 13,
        please ask a parent, guardian or teacher before creating an account.
      </p>

      <h2>Changes</h2>
      <p>If we change what we collect, we&apos;ll update this page and the date at the top.</p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </InfoPage>
  )
}
