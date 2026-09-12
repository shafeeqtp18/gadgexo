import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/db/account";

export type AdminRole = "user" | "editor" | "moderator" | "admin";
const STAFF_ROLES: AdminRole[] = ["editor", "moderator", "admin"];

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
}

async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile, error } = await supabase.from("profiles").select("id, email, name, role").eq("id", user.id).maybeSingle();
  if (error || !profile) return null;
  return profile as AdminUser;
}

/**
 * Redirects to login (unauthenticated) or /admin/unauthorized (authenticated
 * but not staff) — used at the top of every /admin/* page and, again,
 * independently inside every mutating server action. Never trust a client-
 * provided role; this always re-reads profiles.role for the current request.
 */
export async function requireStaff(): Promise<AdminUser> {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/auth/login?next=/admin");
  if (!STAFF_ROLES.includes(admin.role)) redirect("/admin/unauthorized");
  return admin;
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/auth/login?next=/admin");
  if (admin.role !== "admin") redirect("/admin/unauthorized");
  return admin;
}

export function isStaffRole(role: string): boolean {
  return STAFF_ROLES.includes(role as AdminRole);
}
