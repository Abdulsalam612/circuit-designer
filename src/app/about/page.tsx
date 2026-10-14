import type { Metadata } from "next"
import Link from "next/link"
import InfoPage from "@/components/InfoPage"
import { CONTACT_EMAIL, GITHUB_URL, ISSUES_URL } from "@/components/SiteFooter"
import { LESSONS, LEVELS } from "@/content/lessons"

export const metadata: Metadata = {
  title: "About – CirKit",
  description: "What CirKit is, who it's for and how it works.",
}

export default function AboutPage() {
  return (
    <InfoPage
      title="About CirKit"
      intro="A place to learn electronics by building circuits and watching them work – no kit, no soldering iron, nothing to break."
    >
      <h2>What you can do</h2>
      <ul>
        <li>
          <strong>Build circuits</strong> in the <Link href="/simulation">Circuit Editor</Link>: drag in batteries,
          resistors, LEDs, lamps, switches, capacitors and inductors, and wire them up on a grid.
        </li>
        <li>
          <strong>See them run.</strong> The built-in simulator works out the voltage and current everywhere in your
          circuit. Lamps and LEDs light up, current flows along the wires, and CirKit warns you about short circuits,
          broken connections and LEDs that would burn out.
        </li>
        <li>
          <strong>Learn step by step</strong> with {LESSONS.length} <Link href="/dashboard">lessons</Link> across{" "}
          {LEVELS.length} levels, from &ldquo;what is electricity?&rdquo; to series and parallel circuits. Each one ends
          with a quiz or a build challenge that the simulator checks for you.
        </li>
        <li>
          <strong>Save your work</strong> in <Link href="/circuits">My Circuits</Link>, or export it as a file.
        </li>
        <li>
          <strong>CirKit Kids</strong> is a simpler, more playful <Link href="/play">mode for younger learners</Link>.
        </li>
      </ul>

      <h2>Who it&apos;s for</h2>
      <p>
        Anyone curious about how circuits work: students meeting electricity for the first time, hobbyists who want
        to try an idea before reaching for real parts, and teachers looking for something hands-on to use in class.
      </p>

      <h2>How it works</h2>
      <p>
        CirKit runs in your web browser. The simulator is our own: it turns your drawing into a network of connected
        points and solves it with nodal analysis, the same method engineering software uses. It currently handles
        steady (DC) circuits, so capacitors and inductors don&apos;t yet show their charging behaviour over time.
      </p>
      <p>
        Simulated results are a learning tool, not a guarantee of how real components will behave. See our{" "}
        <Link href="/terms">Terms of Use</Link> for safety notes before building anything for real.
      </p>

      <h2>Who made it</h2>
      <p>
        CirKit was created by Abdulsalam Sami as a placement project. It&apos;s open source: you can read the code on{" "}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>

      <h2>Get in touch</h2>
      <p>
        Questions, ideas or school enquiries: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Found a bug?{" "}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">Open an issue on GitHub</a>. For how we handle
        your data, see the <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </InfoPage>
  )
}
