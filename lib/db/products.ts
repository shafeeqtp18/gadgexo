import { createClient } from "@/lib/supabase/server";
import type { Product, ProductWithDetails } from "@/types/domain";

export async function getPublishedProducts(limit = 24, offset = 0): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`*, brand:brands(*), category:categories(*), variants:product_variants(*), images:product_images(*)`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ProductWithDetails | null;
}
