"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireAdmin } from "@/lib/db/admin-auth";
import { logAdminAction } from "@/lib/db/admin-log";

export interface ActionResult {
  error?: string;
}

const PRODUCT_STATUSES = ["draft", "review", "published", "archived", "rejected"];

export async function updateProductAction(productId: string, formData: FormData): Promise<ActionResult> {
  const admin = await requireStaff();
  const supabase = createClient();

  const name = String(formData.get("name") ?? "").trim();
  const short_description = String(formData.get("short_description") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  if (!name) return { error: "Name is required." };
  if (!PRODUCT_STATUSES.includes(status)) return { error: "Invalid status." };

  const { data: before } = await supabase.from("products").select("name, short_description, status").eq("id", productId).maybeSingle();
  if (!before) return { error: "Product not found." };

  const { error } = await supabase.from("products").update({ name, short_description: short_description || null, status }).eq("id", productId);
  if (error) return { error: error.message };

  await logAdminAction({ userId: admin.id, action: "product_updated", entityType: "product", entityId: productId, oldData: before, newData: { name, short_description, status } });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function upsertBrandAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireStaff();
  const supabase = createClient();

  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const is_active = formData.get("is_active") === "on";
  if (!name || !slug) return { error: "Name and slug are required." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: "Slug must be lowercase letters, numbers and hyphens only." };

  const payload = { name, slug, is_active };
  const { error } = id ? await supabase.from("brands").update(payload).eq("id", id) : await supabase.from("brands").insert(payload);
  if (error) return { error: error.message };

  await logAdminAction({ userId: admin.id, action: id ? "brand_updated" : "brand_created", entityType: "brand", entityId: id ?? undefined, newData: payload });
  revalidatePath("/admin/brands");
  return {};
}

export async function upsertCategoryAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireStaff();
  const supabase = createClient();

  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const is_active = formData.get("is_active") === "on";
  if (!name || !slug) return { error: "Name and slug are required." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: "Slug must be lowercase letters, numbers and hyphens only." };

  const payload = { name, slug, is_active };
  const { error } = id ? await supabase.from("categories").update(payload).eq("id", id) : await supabase.from("categories").insert(payload);
  if (error) return { error: error.message };

  await logAdminAction({ userId: admin.id, action: id ? "category_updated" : "category_created", entityType: "category", entityId: id ?? undefined, newData: payload });
  revalidatePath("/admin/categories");
  return {};
}

export async function resolveReviewAction(reviewId: string, status: "approved" | "rejected"): Promise<ActionResult> {
  const admin = await requireStaff();
  const supabase = createClient();

  const { error } = await supabase
    .from("review_queue")
    .update({ status, resolved_at: new Date().toISOString(), resolved_by: admin.id })
    .eq("id", reviewId);
  if (error) return { error: error.message };

  await logAdminAction({ userId: admin.id, action: `review_${status}`, entityType: "review_queue", entityId: reviewId });
  revalidatePath("/admin/review");
  return {};
}

export async function resolveConflictAction(conflictId: string, status: "resolved" | "ignored"): Promise<ActionResult> {
  const admin = await requireStaff();
  const supabase = createClient();

  const { error } = await supabase
    .from("data_conflicts")
    .update({ status, resolved_at: new Date().toISOString(), resolved_by: admin.id })
    .eq("id", conflictId);
  if (error) return { error: error.message };

  await logAdminAction({ userId: admin.id, action: `conflict_${status}`, entityType: "data_conflict", entityId: conflictId });
  revalidatePath("/admin/conflicts");
  return {};
}

const VALID_ROLES = ["user", "editor", "moderator", "admin"];

export async function updateUserRoleAction(targetUserId: string, role: string): Promise<ActionResult> {
  const admin = await requireAdmin(); // admin-only, independently re-verified here
  if (!VALID_ROLES.includes(role)) return { error: "Invalid role." };
  if (targetUserId === admin.id) return { error: "You cannot change your own role." };

  const supabase = createClient();
  // The DB's own prevent_role_escalation trigger is a second, independent
  // backstop against this even if this server-side check were ever bypassed.
  const { error } = await supabase.from("profiles").update({ role }).eq("id", targetUserId);
  if (error) return { error: error.message };

  await logAdminAction({ userId: admin.id, action: "role_changed", entityType: "profile", entityId: targetUserId, newData: { role } });
  revalidatePath("/admin/users");
  return {};
}

export async function updateAutomationSettingsAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const supabase = createClient();

  const enabled = formData.get("enabled") === "on";
  const automation_mode = String(formData.get("automation_mode") ?? "approval");
  if (!["approval", "smart_auto", "full_auto"].includes(automation_mode)) return { error: "Invalid mode." };

  const { data: existing } = await supabase.from("automation_settings").select("id").is("category_id", null).maybeSingle();
  const payload = { enabled, automation_mode, updated_by: admin.id };

  const { error } = existing
    ? await supabase.from("automation_settings").update(payload).eq("id", existing.id)
    : await supabase.from("automation_settings").insert({ ...payload, category_id: null });
  if (error) return { error: error.message };

  await logAdminAction({ userId: admin.id, action: "automation_settings_changed", entityType: "automation_settings", newData: payload });
  revalidatePath("/admin/automation");
  return {};
}
