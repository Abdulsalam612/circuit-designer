import Link from "next/link"
import { CircuitBoard } from "lucide-react"

// Shared footer (landing page + About/Terms/Privacy). Only real links – no "#" placeholders.

export const GITHUB_URL = "https://github.com/Abdulsalam612/circuit-designer"
export const ISSUES_URL = `${GITHUB_URL}/issues`
export const CONTACT_EMAIL = "abdulsalam.sami01@gmail.com"

const COLUMNS: { title: string; colour: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    colour: "text-glow",
    links: [
      { href: "/simulation", label: "Circuit Editor" },
      { href: "/dashboard", label: "Lessons" },
      { href: "/kids", label: "CirKit Kids" },
      { href: "/circuits", label: "My Circuits" },
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

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="bg-brand p-2 rounded-control">
                <CircuitBoard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">CirKit</span>
            </Link>
            <p className="text-white/70">Making electronics education accessible and engaging for everyone.</p>
          </div>

          {COLUMNS.map(column => (
            <div key={column.title}>
              <h3 className={`font-semibold mb-4 ${column.colour}`}>{column.title}</h3>
              <ul className="space-y-2 text-white/70">
                {column.links.map(link => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="hover:text-white transition-colors">
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
