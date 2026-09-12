import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/db/account";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Soft lookup only — display purposes. Every page under this layout does
  // its own requireStaff()/requireAdmin() check; this layout must never be
  // the thing that redirects, or /admin/unauthorized would loop forever.
  const user = await getCurrentUser();
  let displayName: string | null = null;
  let role: string | null = null;
  if (user) {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("name, role").eq("id", user.id).maybeSingle();
    displayName = data?.name ?? user.email ?? null;
    role = data?.role ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar userName={displayName} role={role} className="hidden lg:flex" />
      <AdminMobileNav userName={displayName} role={role} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
