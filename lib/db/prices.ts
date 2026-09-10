import { createClient } from "@/lib/supabase/server";
import type { Price, PriceHistoryEntry } from "@/types/domain";

export async function getBestPriceForVariant(variantId: string): Promise<Price | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prices")
    .select("*")
    .eq("variant_id", variantId)
    .eq("availability", "in_stock")
    .order("price", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPriceHistory(variantId: string): Promise<PriceHistoryEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("variant_id", variantId)
    .order("recorded_at", { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Homepage "Price & Deals Preview" — real prices with a real, computed
 * discount_percent (Postgres generated column, never hand-entered).
 * Callers MUST label these as demo data whenever verification_status
 * is 'unverified' (true for all current seed data) — see DealsPreview.
 */
export async function getFeaturedDeals(limit = 6) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prices")
    .select(`
      price, mrp, discount_percent, availability, verification_status, last_checked_at,
      retailer:retailers(name, slug),
      variant:product_variants(
        id, ram, storage,
        product:products(name, slug, status, brand:brands(name))
      )
    `)
    .eq("availability", "in_stock")
    .not("discount_percent", "is", null)
    .order("discount_percent", { ascending: false })
    .limit(limit * 3); // over-fetch, then filter to published in application code below
  if (error) throw error;
  return (data ?? []).filter((row: any) => row.variant?.product?.status === "published").slice(0, limit);
}
