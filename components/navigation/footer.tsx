import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { SITE_CONFIG } from "@/lib/config/site";

const FOOTER_SECTIONS = [
  {
    title: "Explore",
    links: [
      { label: "Smartphones", href: "/smartphones" },
      { label: "Compare", href: "/compare" },
      { label: "Deals", href: "/deals" },
    ],
  },
  {
    title: "Company",
    // Placeholder routes — real About/Contact content is not Phase 3 scope.
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <LogoMark className="text-lg font-semibold" />
          <p className="mt-2 max-w-xs text-small text-muted-foreground">{SITE_CONFIG.tagline}</p>
        </div>
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title}>
            <h4 className="mb-3 text-label uppercase tracking-wide text-muted-foreground">{section.title}</h4>
            <ul className="flex flex-col gap-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-small text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-4">
        <p className="container text-caption text-muted-foreground">
          © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
