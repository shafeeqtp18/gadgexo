"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, GitCompare, Tag, User, type LucideIcon } from "lucide-react";
import { MOBILE_BOTTOM_NAV } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<string, LucideIcon> = { Home, Compass, GitCompare, Tag, User };

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-header border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <ul className="flex items-center justify-around">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const Icon = ICONS[item.icon] ?? Home;
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-caption",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
