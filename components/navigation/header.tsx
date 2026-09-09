"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/overlays/sheet";
import { DESKTOP_NAV } from "@/lib/constants/nav";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-header border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <LogoMark className="text-xl font-semibold" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {DESKTOP_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-small font-medium text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Account" className="hidden md:inline-flex">
            <User className="h-4 w-4" />
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetTitle className="mb-4 text-h3">Menu</SheetTitle>
              <nav aria-label="Mobile" className="flex flex-col gap-4">
                {DESKTOP_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-body font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
