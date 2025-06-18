import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "CirKit – Build, Simulate & Learn Electronics",
  description:
    "Design and simulate circuits online. Learn electronics step by step with interactive tutorials and gamified challenges.",
  keywords: [
    "circuit design",
    "electronics",
    "breadboard",
    "online simulator",
    "learn electronics",
    "debug circuits",
  ],
  openGraph: {
    title: "CirKit – Build, Simulate & Learn Electronics",
    description:
      "Design and simulate circuits online. Learn electronics step by step with interactive tutorials and gamified challenges.",
    url: "https://yourdomain.com",
    siteName: "CircuitCraft",
    images: [
      {
        url: "https://yourdomain.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "CirKit – Build, Simulate & Learn Electronics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CirKit – Build, Simulate & Learn Electronics",
    description:
      "Design and simulate circuits online. Learn electronics step by step with interactive tutorials and gamified challenges.",
    images: ["https://yourdomain.com/og-image.png"],
    creator: "@AbdulsalamSami",
  },
};

import { AuthProvider } from "@/context/AuthContext";

import Head from "next/head";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        {/* Responsive viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Author */}
        <meta name="author" content="Abdulsalam Sami" />
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="theme-color" content="#0f172a" />
      </Head>
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
