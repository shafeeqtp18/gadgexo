"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/db/account";

export async function updateProfileAction(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length > 100) return { error: "Name is too long." };

  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ name: name || null }).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return {};
}
