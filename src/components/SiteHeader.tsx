"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { BookOpen, ChevronDown, CircuitBoard, FolderOpen, LogOut, Menu, UserRound, X, Zap } from "lucide-react"
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
  const links = signedIn ? APP_LINKS : []
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
    `font-medium transition-colors ${isActive(href) ? "text-[#2176FF]" : "text-gray-600 hover:text-[#31393C]"}`

  return (
    <header className={`bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40 ${sticky ? "sticky top-0" : "relative"}`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="CirKit home">
          <div className="bg-[#2176FF] p-2 rounded-lg">
            <CircuitBoard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-[#31393C]">CirKit</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {sectionLinks.map(link => (
            <a key={link.href} href={link.href} className="font-medium text-gray-600 hover:text-[#31393C] transition-colors">
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
            className="bg-[#F79824] hover:bg-[#FDCA40] text-white px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            CirKit Kids
          </Link>

          {loading ? (
            <div className="h-9 w-9" />
          ) : user ? (
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountOpen(open => !open)}
                className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 hover:bg-gray-100 transition-colors"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Account menu"
              >
                <UserAvatar name={displayName} avatar={profile?.avatar} />
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>

              {accountOpen && (
                <div role="menu" onClick={closeOnLink(setAccountOpen)} className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    {displayName !== user.email && <p className="font-semibold text-[#31393C] truncate">{displayName}</p>}
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <AccountLink href="/profile" icon={UserRound} label="Profile & settings" />
                  <AccountLink href="/dashboard" icon={BookOpen} label="Learning dashboard" />
                  <AccountLink href="/circuits" icon={FolderOpen} label="My Circuits" />
                  <AccountLink href="/simulation" icon={Zap} label="New circuit" />
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
              <button onClick={signIn} className="px-4 py-2 rounded-lg font-medium text-[#2176FF] hover:bg-[#2176FF]/10 transition-colors">
                Sign In
              </button>
              <button onClick={signUp} className="px-4 py-2 rounded-lg font-medium bg-[#2176FF] hover:bg-[#33A1FD] text-white transition-colors">
                Sign Up
              </button>
            </div>
          )}
        </nav>

        {/* Mobile */}
        <button
          className="md:hidden p-2 -mr-2 rounded-lg text-gray-600 hover:text-[#31393C] hover:bg-gray-100"
          onClick={() => setMenuOpen(open => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" onClick={closeOnLink(setMenuOpen)} className="md:hidden border-t border-gray-200 bg-white px-4 pb-4">
          {signedIn && (
            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <UserAvatar name={displayName} avatar={profile?.avatar} />
              <div className="min-w-0 flex-1">
                {displayName !== user?.email && <p className="font-semibold text-[#31393C] truncate">{displayName}</p>}
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link href="/profile" className="shrink-0 text-sm font-medium text-[#2176FF]">Profile</Link>
            </div>
          )}
          <div className="flex flex-col py-2">
            {sectionLinks.map(link => (
              <a key={link.href} href={link.href} className="py-2.5 font-medium text-gray-600">
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
            className="block text-center bg-[#F79824] hover:bg-[#FDCA40] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
          >
            CirKit Kids
          </Link>
          {signedIn ? (
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          ) : !loading && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => { setMenuOpen(false); signIn() }} className="px-4 py-2.5 rounded-lg font-medium text-[#2176FF] border border-[#2176FF]/30">
                Sign In
              </button>
              <button onClick={() => { setMenuOpen(false); signUp() }} className="px-4 py-2.5 rounded-lg font-medium bg-[#2176FF] text-white">
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
    <Link role="menuitem" href={href} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
      <Icon className="h-4 w-4 text-gray-400" />
      {label}
    </Link>
  )
}
