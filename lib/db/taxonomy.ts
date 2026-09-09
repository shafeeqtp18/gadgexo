import { createClient } from "@/lib/supabase/server";
import type { Brand, Category } from "@/types/domain";

export async function getActiveBrands(): Promise<Brand[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("brands").select("*").eq("is_active", true).order("name");
  if (error) throw error;
  return data;
}

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("name");
  if (error) throw error;
  return data;
}
