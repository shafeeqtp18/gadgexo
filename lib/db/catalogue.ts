import { createClient } from "@/lib/supabase/server";
import { computePriceDrop, type PriceDrop } from "@/lib/catalogue/price-drop";
import {
  CATALOGUE_PAGE_SIZE,
  PRICE_BUCKETS,
  PRICE_SORT_FETCH_CAP,
  type CatalogueCardProduct,
  type CatalogueFilterOptions,
  type CatalogueFilters,
} from "@/lib/catalogue/types";

const CARD_SPEC_SLUGS = ["display-size", "chipset", "battery-capacity"];

const CARD_SELECT = `
  id, name, slug, verification_status, release_date,
  brand:brands(name, slug),
  images:product_images(image_url, is_primary),
  variants:product_variants(id, ram, storage, availability),
  specs:product_specifications(
    value,
    specification:specifications(slug, name, unit)
  )
`;

function mapSpecHighlights(specs: any[]): { label: string; value: string }[] {
  if (!specs) return [];
  return specs
    .filter((s) => CARD_SPEC_SLUGS.includes(s.specification?.slug))
    .sort((a, b) => CARD_SPEC_SLUGS.indexOf(a.specification.slug) - CARD_SPEC_SLUGS.indexOf(b.specification.slug))
    .slice(0, 3)
    .map((s) => ({
      label: s.specification.name,
      value: s.specification.unit ? `${s.value} ${s.specification.unit}` : s.value,
    }));
}

export async function getCatalogueFilterOptions(): Promise<CatalogueFilterOptions> {
  const supabase = createClient();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, brand_id, brand:brands(name, slug)")
    .eq("status", "published");
  if (productsError) throw productsError;

  const brandCounts = new Map<string, { slug: string; name: string; count: number }>();
  for (const p of products ?? []) {
    const brand = (p as any).brand;
    if (!brand) continue;
    const existing = brandCounts.get(brand.slug);
    brandCounts.set(brand.slug, { slug: brand.slug, name: brand.name, count: (existing?.count ?? 0) + 1 });
  }

  const productIds = (products ?? []).map((p) => p.id);
  const ramCounts = new Map<string, number>();
  const storageCounts = new Map<string, number>();

  if (productIds.length > 0) {
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("ram, storage")
      .in("product_id", productIds);
    if (variantsError) throw variantsError;

    for (const v of variants ?? []) {
      if (v.ram) ramCounts.set(v.ram, (ramCounts.get(v.ram) ?? 0) + 1);
      if (v.storage) storageCounts.set(v.storage, (storageCounts.get(v.storage) ?? 0) + 1);
    }
  }

  return {
    brands: [...brandCounts.values()].sort((a, b) => a.name.localeCompare(b.name)),
    ram: [...ramCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => parseInt(a.value) - parseInt(b.value)),
    storage: [...storageCounts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => parseInt(a.value) - parseInt(b.value)),
  };
}

async function resolveBrandIds(supabase: ReturnType<typeof createClient>, slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];
  const { data, error } = await supabase.from("brands").select("id").in("slug", slugs);
  if (error) throw error;
  return (data ?? []).map((b) => b.id);
}

async function resolveProductIdsByVariant(
  supabase: ReturnType<typeof createClient>,
  ram: string[],
  storage: string[],
): Promise<string[] | null> {
  if (ram.length === 0 && storage.length === 0) return null;
  let query = supabase.from("product_variants").select("product_id");
  if (ram.length > 0) query = query.in("ram", ram);
  if (storage.length > 0) query = query.in("storage", storage);
  const { data, error } = await query;
  if (error) throw error;
  return [...new Set((data ?? []).map((v) => v.product_id))];
}

interface PriceInfo {
  price: number;
  verification_status: string;
  drop: PriceDrop | null;
}

/** Min in-stock price per product, plus a genuine price-drop (Phase 8) computed from that variant's price_history. Exported (Phase 9) so the wishlist page can reuse it instead of duplicating this query. */
export async function getPriceInfoByProductId(
  supabase: ReturnType<typeof createClient>,
  productIds: string[],
): Promise<Map<string, PriceInfo>> {
  const result = new Map<string, PriceInfo>();
  if (productIds.length === 0) return result;

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, product_id")
    .in("product_id", productIds);
  if (variantsError) throw variantsError;
  const variantToProduct = new Map((variants ?? []).map((v) => [v.id, v.product_id]));
  const variantIds = [...variantToProduct.keys()];
  if (variantIds.length === 0) return result;

  const [pricesRes, historyRes] = await Promise.all([
    supabase.from("prices").select("variant_id, price, verification_status").in("variant_id", variantIds).eq("availability", "in_stock"),
    supabase.from("price_history").select("variant_id, price, recorded_at").in("variant_id", variantIds),
  ]);
  if (pricesRes.error) throw pricesRes.error;
  if (historyRes.error) throw historyRes.error;

  const historyByVariant = new Map<string, { price: number; recorded_at: string }[]>();
  for (const h of historyRes.data ?? []) {
    const list = historyByVariant.get(h.variant_id) ?? [];
    list.push({ price: h.price, recorded_at: h.recorded_at });
    historyByVariant.set(h.variant_id, list);
  }

  // Track which variant currently holds each product's best price, so the
  // drop we compute matches the price actually shown on the card.
  const bestVariantForProduct = new Map<string, string>();

  for (const row of pricesRes.data ?? []) {
    const productId = variantToProduct.get(row.variant_id);
    if (!productId) continue;
    const existing = result.get(productId);
    if (!existing || row.price < existing.price) {
      result.set(productId, { price: row.price, verification_status: row.verification_status, drop: null });
      bestVariantForProduct.set(productId, row.variant_id);
    }
  }

  for (const [productId, variantId] of bestVariantForProduct) {
    const info = result.get(productId);
    if (!info) continue;
    info.drop = computePriceDrop(info.price, historyByVariant.get(variantId) ?? []);
  }

  return result;
}

export async function listCatalogueProducts(
  filters: CatalogueFilters,
): Promise<{ products: CatalogueCardProduct[]; total: number; priceDataLimited: boolean }> {
  const supabase = createClient();
  const needsPriceComputation = Boolean(filters.priceBucket) || filters.sort === "price-low" || filters.sort === "price-high";

  let query = supabase.from("products").select(CARD_SELECT, { count: "exact" }).eq("status", "published");

  if (filters.q) {
    const { data: matchingBrands } = await supabase.from("brands").select("id").ilike("name", `%${filters.q}%`);
    const brandIds = (matchingBrands ?? []).map((b) => b.id);
    const brandClause = brandIds.length > 0 ? `,brand_id.in.(${brandIds.join(",")})` : "";
    query = query.or(`name.ilike.%${filters.q}%${brandClause}`);
  }

  if (filters.brands.length > 0) {
    const brandIds = await resolveBrandIds(supabase, filters.brands);
    query = query.in("brand_id", brandIds.length > 0 ? brandIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const variantProductIds = await resolveProductIdsByVariant(supabase, filters.ram, filters.storage);
  if (variantProductIds !== null) {
    query = query.in("id", variantProductIds.length > 0 ? variantProductIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  if (filters.sort === "name-asc") query = query.order("name", { ascending: true });
  else if (filters.sort === "name-desc") query = query.order("name", { ascending: false });
  else if (filters.sort === "newest") query = query.order("release_date", { ascending: false, nullsFirst: false });
  else query = query.order("is_trending", { ascending: false }).order("is_featured", { ascending: false }).order("created_at", { ascending: false });

  if (!needsPriceComputation) {
    const from = (filters.page - 1) * CATALOGUE_PAGE_SIZE;
    const { data, error, count } = await query.range(from, from + CATALOGUE_PAGE_SIZE - 1);
    if (error) throw error;

    const productIds = (data ?? []).map((p) => p.id);
    const priceInfo = await getPriceInfoByProductId(supabase, productIds);

    const products: CatalogueCardProduct[] = (data ?? []).map((p: any) => ({
      ...p,
      specHighlights: mapSpecHighlights(p.specs),
      startingPrice: priceInfo.get(p.id)?.price ?? null,
      priceVerificationStatus: priceInfo.get(p.id)?.verification_status ?? null,
      priceDrop: priceInfo.get(p.id)?.drop ?? null,
    }));

    return { products, total: count ?? 0, priceDataLimited: false };
  }

  const { data, error } = await query.range(0, PRICE_SORT_FETCH_CAP - 1);
  if (error) throw error;

  const allIds = (data ?? []).map((p) => p.id);
  const priceInfo = await getPriceInfoByProductId(supabase, allIds);

  let withPrices: CatalogueCardProduct[] = (data ?? []).map((p: any) => ({
    ...p,
    specHighlights: mapSpecHighlights(p.specs),
    startingPrice: priceInfo.get(p.id)?.price ?? null,
    priceVerificationStatus: priceInfo.get(p.id)?.verification_status ?? null,
    priceDrop: priceInfo.get(p.id)?.drop ?? null,
  }));

  if (filters.priceBucket) {
    const bucket = PRICE_BUCKETS.find((b) => b.value === filters.priceBucket);
    if (bucket) {
      withPrices = withPrices.filter(
        (p) => p.startingPrice !== null && p.startingPrice >= bucket.min && p.startingPrice < bucket.max,
      );
    }
  }

  if (filters.sort === "price-low") {
    withPrices.sort((a, b) => (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity));
  } else if (filters.sort === "price-high") {
    withPrices.sort((a, b) => (b.startingPrice ?? -Infinity) - (a.startingPrice ?? -Infinity));
  }

  const total = withPrices.length;
  const from = (filters.page - 1) * CATALOGUE_PAGE_SIZE;
  const page = withPrices.slice(from, from + CATALOGUE_PAGE_SIZE);

  return { products: page, total, priceDataLimited: (data ?? []).length >= PRICE_SORT_FETCH_CAP };
}
