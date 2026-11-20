import Link from "next/link"
import Wordmark from "@/components/Wordmark"
import AccountPageLink from "@/components/AccountPageLink"

// Shared footer (landing page + About/Terms/Privacy). Only real links – no "#" placeholders.
// A server component, so the constants below can be imported by server pages. Links marked
// `account` go through AccountPageLink, which sends signed-out visitors to sign-up first.

export const GITHUB_URL = "https://github.com/Abdulsalam612/circuit-designer"
export const ISSUES_URL = `${GITHUB_URL}/issues`
export const CONTACT_EMAIL = "abdulsalam.sami01@gmail.com"

const COLUMNS: { title: string; colour: string; links: { href: string; label: string; external?: boolean; account?: boolean }[] }[] = [
  {
    title: "Product",
    colour: "text-glow",
    links: [
      { href: "/dashboard", label: "Lessons", account: true },
      { href: "/simulation", label: "Circuit Editor", account: true },
      { href: "/circuits", label: "My Circuits", account: true },
      { href: "/kids", label: "CirKit Kids" },
    ],
  },
  {
    title: "CirKit",
    colour: "text-glow",
    links: [
      { href: "/about", label: "About" },
      { href: GITHUB_URL, label: "Source code", external: true },
    ],
  },
  {
    title: "Help & legal",
    colour: "text-glow",
    links: [
      { href: "/feedback?type=bug", label: "Report a problem" },
      { href: "/feedback", label: "Send feedback" },
      { href: `mailto:${CONTACT_EMAIL}`, label: "Contact", external: true },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
    ],
  },
]

// Taller links (about 36 px) so they're easier to tap than a bare line of text
const footerLink = "inline-block py-1.5 hover:text-white transition-colors"

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white py-12">
      {/* Same container as the pages and the header */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-4">
              <Wordmark onDark />
            </div>
            <p className="text-white/70">Making electronics education accessible and engaging for everyone.</p>
          </div>

          {COLUMNS.map(column => (
            <div key={column.title}>
              <h3 className={`font-semibold mb-3 ${column.colour}`}>{column.title}</h3>
              <ul className="text-white/70">
                {column.links.map(link => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={footerLink}
                      >
                        {link.label}
                      </a>
                    ) : link.account ? (
                      <AccountPageLink href={link.href} className={footerLink}>{link.label}</AccountPageLink>
                    ) : (
                      <Link href={link.href} className={footerLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 mt-8 pt-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} CirKit · Made by Abdulsalam Sami</p>
        </div>
      </div>
    </footer>
  )
}
