"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getComparisonInternalId } from "@/lib/db/compare";
import { getProductDetailById, type ProductDetail } from "@/lib/db/product-detail";

const MAX_COMPARE = 4;

/** Creates a new anonymous comparison from a set of product ids and redirects to its shareable URL. */
export async function createComparison(productIds: string[]): Promise<void> {
  if (productIds.length < 2) throw new Error("Select at least 2 products to compare.");
  if (productIds.length > MAX_COMPARE) throw new Error(`Compare up to ${MAX_COMPARE} gadgets at a time.`);

  const supabase = createClient();
  const { data: comparison, error: comparisonError } = await supabase
    .from("comparisons")
    .insert({ user_id: null })
    .select("id, share_token")
    .single();
  if (comparisonError) throw comparisonError;

  const items = productIds.map((product_id, i) => ({ comparison_id: comparison.id, product_id, position: i + 1 }));
  const { error: itemsError } = await supabase.from("comparison_items").insert(items);
  if (itemsError) throw itemsError;

  redirect(`/compare/${comparison.share_token}`);
}

export async function addProductToComparison(token: string, productId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const comparisonId = await getComparisonInternalId(token);
  if (!comparisonId) return { error: "Comparison not found." };

  const { count, error: countError } = await supabase
    .from("comparison_items")
    .select("id", { count: "exact", head: true })
    .eq("comparison_id", comparisonId);
  if (countError) return { error: countError.message };
  if ((count ?? 0) >= MAX_COMPARE) return { error: `Compare up to ${MAX_COMPARE} gadgets at a time.` };

  const { error } = await supabase.from("comparison_items").insert({
    comparison_id: comparisonId,
    product_id: productId,
    position: (count ?? 0) + 1,
  });
  if (error) return { error: "Couldn't add that product — it may already be in this comparison." };

  revalidatePath(`/compare/${token}`);
  return {};
}

export async function removeProductFromComparison(token: string, productId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const comparisonId = await getComparisonInternalId(token);
  if (!comparisonId) return { error: "Comparison not found." };

  const { error } = await supabase.from("comparison_items").delete().eq("comparison_id", comparisonId).eq("product_id", productId);
  if (error) return { error: error.message };

  revalidatePath(`/compare/${token}`);
  return {};
}

/** Resolves full product detail for a set of ids — used by the staging page once it knows the locally-selected ids (from browser storage). */
export async function getStagingProducts(ids: string[]): Promise<ProductDetail[]> {
  const results = await Promise.all(ids.map((id) => getProductDetailById(id)));
  return results.filter((p): p is ProductDetail => p !== null);
}

export async function clearComparison(token: string): Promise<void> {
  const supabase = createClient();
  const comparisonId = await getComparisonInternalId(token);
  if (!comparisonId) return;
  await supabase.from("comparisons").delete().eq("id", comparisonId); // cascades to comparison_items
  redirect("/compare");
}

/** Lightweight search for the "Add Gadget" control — name/brand match, published only, excludes products already in the comparison. */
export async function searchProductsForCompare(query: string, excludeIds: string[]): Promise<{ id: string; name: string; brandName: string | null }[]> {
  if (!query.trim()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand:brands(name)")
    .eq("status", "published")
    .ilike("name", `%${query.trim()}%`)
    .limit(6);
  if (error) throw error;
  return (data ?? [])
    .filter((p) => !excludeIds.includes(p.id))
    .map((p) => ({ id: p.id, name: p.name, brandName: (p as any).brand?.name ?? null }));
}
