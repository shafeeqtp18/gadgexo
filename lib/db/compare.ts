import { createClient } from "@/lib/supabase/server";
import { getProductDetailById, type ProductDetail } from "@/lib/db/product-detail";

export interface ComparisonRecord {
  token: string;
  productIds: string[]; // in saved position order
  products: ProductDetail[]; // resolved, published only — a removed/unpublished product is simply absent
}

export async function getComparisonByToken(token: string): Promise<ComparisonRecord | null> {
  const supabase = createClient();

  const { data: comparison, error: comparisonError } = await supabase
    .from("comparisons")
    .select("id, share_token")
    .eq("share_token", token)
    .maybeSingle();
  if (comparisonError) throw comparisonError;
  if (!comparison) return null;

  const { data: items, error: itemsError } = await supabase
    .from("comparison_items")
    .select("product_id, position")
    .eq("comparison_id", comparison.id)
    .order("position", { ascending: true });
  if (itemsError) throw itemsError;

  const productIds = (items ?? []).map((i) => i.product_id);
  const products = (await Promise.all(productIds.map((id) => getProductDetailById(id)))).filter(
    (p): p is ProductDetail => p !== null,
  );

  return { token, productIds, products };
}

export async function getComparisonInternalId(token: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("comparisons").select("id").eq("share_token", token).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
