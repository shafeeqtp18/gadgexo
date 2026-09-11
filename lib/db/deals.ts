import { createClient } from "@/lib/supabase/server";
import { computePriceDrop, type PriceDrop } from "@/lib/catalogue/price-drop";

export interface DealEntry {
  priceId: string;
  price: number;
  mrp: number | null;
  discountPercent: number | null;
  verificationStatus: string;
  lastCheckedAt: string;
  productUrl: string;
  retailer: { name: string; slug: string };
  variant: { ram: string | null; storage: string | null };
  product: { id: string; name: string; slug: string; verification_status: string };
  brand: { name: string } | null;
  image: string | null;
  drop: PriceDrop | null;
}

export type DealSort = "price-low" | "price-high" | "biggest-drop" | "recent";

export async function getDeals(sort: DealSort = "recent"): Promise<{ deals: DealEntry[]; priceDrops: DealEntry[] }> {
  const supabase = createClient();

  const { data: prices, error } = await supabase
    .from("prices")
    .select(`
      id, price, mrp, discount_percent, verification_status, last_checked_at, product_url,
      retailer:retailers(name, slug),
      variant:product_variants(
        id, ram, storage,
        product:products(id, name, slug, status, verification_status, brand:brands(name), images:product_images(image_url, is_primary))
      )
    `)
    .eq("availability", "in_stock");
  if (error) throw error;

  const published = (prices ?? []).filter((p: any) => p.variant?.product?.status === "published");
  if (published.length === 0) return { deals: [], priceDrops: [] };

  const variantIds = [...new Set(published.map((p: any) => p.variant.id))];
  const { data: history, error: historyError } = await supabase
    .from("price_history")
    .select("variant_id, price, recorded_at")
    .in("variant_id", variantIds);
  if (historyError) throw historyError;

  const historyByVariant = new Map<string, { price: number; recorded_at: string }[]>();
  for (const h of history ?? []) {
    const list = historyByVariant.get(h.variant_id) ?? [];
    list.push({ price: h.price, recorded_at: h.recorded_at });
    historyByVariant.set(h.variant_id, list);
  }

  const deals: DealEntry[] = published.map((p: any) => {
    const product = p.variant.product;
    const image = (product.images ?? []).find((i: any) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url ?? null;
    const variantHistory = historyByVariant.get(p.variant.id) ?? [];
    return {
      priceId: p.id,
      price: p.price,
      mrp: p.mrp,
      discountPercent: p.discount_percent,
      verificationStatus: p.verification_status,
      lastCheckedAt: p.last_checked_at,
      productUrl: p.product_url,
      retailer: p.retailer,
      variant: { ram: p.variant.ram, storage: p.variant.storage },
      product: { id: product.id, name: product.name, slug: product.slug, verification_status: product.verification_status },
      brand: product.brand,
      image,
      drop: computePriceDrop(p.price, variantHistory),
    };
  });

  const sorted = sortDeals(deals, sort);
  const priceDrops = sortDeals(
    deals.filter((d) => d.drop !== null),
    "biggest-drop",
  );

  return { deals: sorted, priceDrops };
}

function sortDeals(deals: DealEntry[], sort: DealSort): DealEntry[] {
  const copy = [...deals];
  switch (sort) {
    case "price-low":
      return copy.sort((a, b) => a.price - b.price);
    case "price-high":
      return copy.sort((a, b) => b.price - a.price);
    case "biggest-drop":
      return copy.sort((a, b) => (b.drop?.percent ?? -1) - (a.drop?.percent ?? -1));
    case "recent":
    default:
      return copy.sort((a, b) => new Date(b.lastCheckedAt).getTime() - new Date(a.lastCheckedAt).getTime());
  }
}
