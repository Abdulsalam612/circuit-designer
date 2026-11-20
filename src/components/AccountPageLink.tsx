"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"
import { signupHref } from "@/components/auth/authLinks"

// A link to an account-only page (Lessons, the editor, My Circuits) for places that don't know
// who is signed in, such as the footer (a server component, so its constants stay importable
// from server pages). Signed-out visitors go to sign-up and then on to the page; while auth is
// still loading it keeps the plain link, which the page itself guards anyway.
export default function AccountPageLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const { user, loading } = useAuth()
  const target = !loading && !user ? signupHref(href) : href
  return <Link href={target} className={className}>{children}</Link>
}
