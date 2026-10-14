import Link from "next/link"
import { BookOpen, Home, Zap } from "lucide-react"
import StatusPage, { primaryButton, secondaryButton } from "@/components/StatusPage"

export default function NotFound() {
  return (
    <StatusPage
      code="404 · Page not found"
      title="Open circuit!"
      message="This page isn't connected to anything. The link may be broken, or the page may have moved."
      variant="open"
    >
      {/* React 19 moves <title> into <head> */}
      <title>Page not found – CirKit</title>
      <Link href="/" className={primaryButton}>
        <Home className="h-4 w-4" /> Go home
      </Link>
      <Link href="/dashboard" className={secondaryButton}>
        <BookOpen className="h-4 w-4" /> Lessons
      </Link>
      <Link href="/simulation" className={secondaryButton}>
        <Zap className="h-4 w-4" /> Circuit Editor
      </Link>
    </StatusPage>
  )
}
