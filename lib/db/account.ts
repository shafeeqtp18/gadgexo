import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

/** Server-revalidated — safe to use for authorization decisions (unlike a raw session-cookie read). */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("id, name, email, avatar_url, created_at").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
