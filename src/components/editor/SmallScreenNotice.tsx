import { BookOpen } from "lucide-react"
import StatusPage, { primaryButton, secondaryButton } from "@/components/StatusPage"
import Link from "next/link"

// Shown instead of the editor below the md breakpoint: the parts bin, board and Properties
// panel don't fit on a phone, and building needs a mouse for now. The page hides this with
// `md:hidden` and the editor with `hidden md:flex`, so it needs no JavaScript to pick.
export default function SmallScreenNotice() {
  return (
    <StatusPage
      code="Circuit editor"
      title="The circuit editor needs a bigger screen"
      message="Try a tablet or computer. You can still read the lessons on your phone."
      variant="open"
    >
      <Link href="/dashboard" className={primaryButton}>
        <BookOpen className="h-4 w-4" /> Go to lessons
      </Link>
      <Link href="/" className={secondaryButton}>Home</Link>
    </StatusPage>
  )
}
