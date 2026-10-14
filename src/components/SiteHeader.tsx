"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { BookOpen, ChevronDown, CircuitBoard, FolderOpen, LogOut, Menu, MessageSquare, UserRound, X, Zap } from "lucide-react"
import { auth } from "@/firebase"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import UserAvatar from "@/components/UserAvatar"

// Shared top bar for the website pages (home, dashboard, My Circuits, lessons).
// The editor and kids mode keep their own toolbars – they need the space.

interface NavLink {
  href: string
  label: string
}

const APP_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Learn" },
  { href: "/simulation", label: "Circuit Editor" },
  { href: "/circuits", label: "My Circuits" },
]

const PUBLIC_LINKS: NavLink[] = [{ href: "/about", label: "About" }]

interface SiteHeaderProps {
  // Extra in-page links, e.g. the landing page's "#features"
  sectionLinks?: NavLink[]
  // The landing page opens its own modals; elsewhere Sign In goes to the landing page's login
  onSignIn?: () => void
  onSignUp?: () => void
  // Off where the page has its own sticky bar underneath (the lesson viewer)
  sticky?: boolean
}

// Following a link to the page you're already on doesn't change the path, so close explicitly
const closeOnLink = (setOpen: (open: boolean) => void) => (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest("a")) setOpen(false)
}

export default function SiteHeader({ sectionLinks = [], onSignIn, onSignUp, sticky = true }: SiteHeaderProps) {
  const { user, loading, profile } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  // Close both menus when the page changes
  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [pathname])

  // Account dropdown: close on outside click or Escape
  useEffect(() => {
    if (!accountOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [accountOpen])

  const displayName = profile?.name || user?.displayName || user?.email || ""
  const signedIn = !loading && !!user
  // Signed-out visitors can't open the app pages, so only show them the public links
  const links = signedIn ? APP_LINKS : loading ? [] : PUBLIC_LINKS
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
    || (href === "/dashboard" && pathname.startsWith("/learn/"))

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Protected pages would otherwise bounce to the login modal
      router.push("/")
      toast.info("You've been logged out.")
    } catch {
      toast.error("Logout failed. Please try again.")
    }
  }

  const signIn = () => (onSignIn ? onSignIn() : router.push("/?login=1"))
  const signUp = () => (onSignUp ? onSignUp() : router.push("/?signup=1"))

  const linkClass = (href: string) =>
    `font-medium transition-colors ${isActive(href) ? "text-signal" : "text-ink-muted hover:text-ink"}`

  return (
    <header className={`bg-white/95 backdrop-blur-sm border-b border-line z-40 ${sticky ? "sticky top-0" : "relative"}`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="CirKit home">
          <div className="bg-brand p-2 rounded-control">
            <CircuitBoard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-ink">CirKit</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {sectionLinks.map(link => (
            <a key={link.href} href={link.href} className="font-medium text-ink-muted hover:text-ink transition-colors">
              {link.label}
            </a>
          ))}
          {links.map(link => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)} aria-current={isActive(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/play"
            className="bg-carrot hover:bg-glow text-ink px-5 py-2 rounded-control font-semibold shadow-[0_2px_0_var(--color-carrot-dark)] transition-colors"
          >
            CirKit Kids
          </Link>

          {loading ? (
            <div className="h-9 w-9" />
          ) : user ? (
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountOpen(open => !open)}
                className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 hover:bg-ink/5 transition-colors"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Account menu"
              >
                <UserAvatar name={displayName} avatar={profile?.avatar} />
                <ChevronDown className={`h-4 w-4 text-ink-muted transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>

              {accountOpen && (
                <div role="menu" onClick={closeOnLink(setAccountOpen)} className="absolute right-0 mt-2 w-64 rounded-card border border-line bg-white shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-line mb-1">
                    {displayName !== user.email && <p className="font-semibold text-ink truncate">{displayName}</p>}
                    <p className="text-sm text-ink-muted truncate">{user.email}</p>
                  </div>
                  <AccountLink href="/profile" icon={UserRound} label="Profile & settings" />
                  <AccountLink href="/dashboard" icon={BookOpen} label="Learning dashboard" />
                  <AccountLink href="/circuits" icon={FolderOpen} label="My Circuits" />
                  <AccountLink href="/simulation" icon={Zap} label="New circuit" />
                  <AccountLink href="/feedback" icon={MessageSquare} label="Send feedback" />
                  <div className="border-t border-line mt-1 pt-1">
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger-tint transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={signIn} className="px-4 py-2 rounded-control font-medium text-signal hover:bg-signal-tint transition-colors">
                Sign In
              </button>
              <button onClick={signUp} className="px-4 py-2 rounded-control font-medium bg-signal hover:bg-signal-hover text-white transition-colors">
                Sign Up
              </button>
            </div>
          )}
        </nav>

        {/* Mobile */}
        <button
          className="md:hidden p-2 -mr-2 rounded-control text-ink-muted hover:text-ink hover:bg-ink/5"
          onClick={() => setMenuOpen(open => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" onClick={closeOnLink(setMenuOpen)} className="md:hidden border-t border-line bg-white px-4 pb-4">
          {signedIn && (
            <div className="flex items-center gap-3 py-3 border-b border-line">
              <UserAvatar name={displayName} avatar={profile?.avatar} />
              <div className="min-w-0 flex-1">
                {displayName !== user?.email && <p className="font-semibold text-ink truncate">{displayName}</p>}
                <p className="text-sm text-ink-muted truncate">{user?.email}</p>
              </div>
              <Link href="/profile" className="shrink-0 text-sm font-medium text-signal">Profile</Link>
            </div>
          )}
          <div className="flex flex-col py-2">
            {sectionLinks.map(link => (
              <a key={link.href} href={link.href} className="py-2.5 font-medium text-ink-muted">
                {link.label}
              </a>
            ))}
            {links.map(link => (
              <Link key={link.href} href={link.href} className={`py-2.5 ${linkClass(link.href)}`} aria-current={isActive(link.href) ? "page" : undefined}>
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/play"
            className="block text-center bg-carrot hover:bg-glow text-ink px-5 py-2.5 rounded-control font-semibold shadow-[0_2px_0_var(--color-carrot-dark)] transition-colors"
          >
            CirKit Kids
          </Link>
          {signedIn ? (
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-control font-medium text-danger border border-danger/30 hover:bg-danger-tint transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          ) : !loading && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => { setMenuOpen(false); signIn() }} className="px-4 py-2.5 rounded-control font-medium text-signal border border-signal/30">
                Sign In
              </button>
              <button onClick={() => { setMenuOpen(false); signUp() }} className="px-4 py-2.5 rounded-control font-medium bg-signal text-white">
                Sign Up
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}

function AccountLink({ href, icon: Icon, label }: { href: string; icon: typeof BookOpen; label: string }) {
  return (
    <Link role="menuitem" href={href} className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-paper transition-colors">
      <Icon className="h-4 w-4 text-ink-faint" />
      {label}
    </Link>
  )
}
