import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  themeColor: "#0f172a",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
