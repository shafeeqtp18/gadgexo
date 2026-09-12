import Link from "next/link";
import {
  LayoutDashboard, Package, Tag, FolderTree, IndianRupee, Database,
  ClipboardCheck, AlertTriangle, Users, Cog, ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/prices", label: "Prices", icon: IndianRupee },
  { href: "/admin/sources", label: "Sources", icon: Database },
  { href: "/admin/review", label: "Reviews", icon: ClipboardCheck },
  { href: "/admin/conflicts", label: "Conflicts", icon: AlertTriangle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/automation", label: "Automation", icon: Cog },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

export function AdminSidebar({ userName, role, className }: { userName: string | null; role: string | null; className?: string }) {
  return (
    <aside className={cn("w-60 shrink-0 border-r border-border bg-surface-elevated p-4", className)}>
      <div className="mb-6">
        <p className="text-small font-semibold">GadGexo Admin</p>
        {userName && <p className="text-caption text-muted-foreground">{userName} · {role}</p>}
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-small text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
      <Link href="/" className="mt-6 block text-caption text-muted-foreground hover:text-primary">← Back to site</Link>
    </aside>
  );
}
