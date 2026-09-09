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
