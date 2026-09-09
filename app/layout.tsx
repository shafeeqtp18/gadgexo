import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { Toaster } from "@/components/feedback/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_CONFIG } from "@/lib/config/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: { default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`, template: `%s | ${SITE_CONFIG.name}` },
  description: SITE_CONFIG.description,
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans`}>
        <ThemeProvider>
          <TooltipProvider>
            {/* Skip link — first focusable element, visible only on focus. */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <Header />
            <main id="main-content" className="pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
