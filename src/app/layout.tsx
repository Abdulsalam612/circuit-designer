import type { Metadata, Viewport } from "next";
import { Lexend, Unbounded } from "next/font/google";
import "./globals.css";

// Design tokens in globals.css map these to font-display / font-sans
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  display: "swap",
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

// Public address of the site, used to make Open Graph / Twitter URLs absolute.
// Change it here when CirKit gets a custom domain.
const SITE_URL = "https://circuit-designer-abdulsalam612s-projects.vercel.app";

const TITLE = "CirKit – Build, Simulate & Learn Electronics";
const DESCRIPTION =
  "Design and simulate circuits online. Learn electronics step by step with interactive lessons and hands-on circuit challenges.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: "Abdulsalam Sami" }],
  keywords: [
    "circuit design",
    "electronics",
    "breadboard",
    "online simulator",
    "learn electronics",
    "debug circuits",
  ],
  // The share image comes from opengraph-image.tsx / twitter-image.tsx in this folder
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "CirKit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@AbdulsalamSami",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#31393C",
};

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables go on <html>: the design tokens (globals.css @theme) are defined on :root
    // and read them there
    <html lang="en" className={`${unbounded.variable} ${lexend.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
