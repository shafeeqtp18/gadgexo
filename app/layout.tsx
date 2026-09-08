import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_CONFIG } from "@/lib/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dark is the default brand experience (Master Context §11).
  // A theme *toggle* is Phase 3 work — this just sets the default class.
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
