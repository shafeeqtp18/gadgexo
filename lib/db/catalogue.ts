import { createClient } from "@/lib/supabase/server";
import {
  CATALOGUE_PAGE_SIZE,
  PRICE_BUCKETS,
  PRICE_SORT_FETCH_CAP,
  type CatalogueCardProduct,
  type CatalogueFilterOptions,
  type CatalogueFilters,
} from "@/lib/catalogue/types";

// Small, curated set of specs worth showing on a catalogue card. Only
// specs the seed data actually populates for at least one product should
// be relied on here — anything else silently renders nothing, which is
// correct (see NO_FAKE_DATA in the Phase 5 brief) rather than a gap.
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

/** Distinct brand/RAM/storage values that actually appear among published products — never a hard-coded list. */
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
  if (ram.length === 0 && storage.length === 0) return null; // no variant-level filter active
  let query = supabase.from("product_variants").select("product_id");
  if (ram.length > 0) query = query.in("ram", ram);
  if (storage.length > 0) query = query.in("storage", storage);
  const { data, error } = await query;
  if (error) throw error;
  return [...new Set((data ?? []).map((v) => v.product_id))];
}

/** In-stock minimum price per product, keyed by product id. Products with no in-stock price are simply absent — never a fabricated 0 or fallback. */
async function getMinPricesByProductId(
  supabase: ReturnType<typeof createClient>,
  productIds: string[],
): Promise<Map<string, { price: number; verification_status: string }>> {
  const result = new Map<string, { price: number; verification_status: string }>();
  if (productIds.length === 0) return result;

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, product_id")
    .in("product_id", productIds);
  if (variantsError) throw variantsError;
  const variantToProduct = new Map((variants ?? []).map((v) => [v.id, v.product_id]));
  const variantIds = [...variantToProduct.keys()];
  if (variantIds.length === 0) return result;

  const { data: prices, error: pricesError } = await supabase
    .from("prices")
    .select("variant_id, price, verification_status")
    .in("variant_id", variantIds)
    .eq("availability", "in_stock");
  if (pricesError) throw pricesError;

  for (const row of prices ?? []) {
    const productId = variantToProduct.get(row.variant_id);
    if (!productId) continue;
    const existing = result.get(productId);
    if (!existing || row.price < existing.price) {
      result.set(productId, { price: row.price, verification_status: row.verification_status });
    }
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

  // Non-price sort applied at the DB level regardless of path — cheap and
  // gives a sensible base order even when we resort in memory afterward.
  if (filters.sort === "name-asc") query = query.order("name", { ascending: true });
  else if (filters.sort === "name-desc") query = query.order("name", { ascending: false });
  else if (filters.sort === "newest") query = query.order("release_date", { ascending: false, nullsFirst: false });
  else query = query.order("is_trending", { ascending: false }).order("is_featured", { ascending: false }).order("created_at", { ascending: false });

  if (!needsPriceComputation) {
    const from = (filters.page - 1) * CATALOGUE_PAGE_SIZE;
    const { data, error, count } = await query.range(from, from + CATALOGUE_PAGE_SIZE - 1);
    if (error) throw error;

    const productIds = (data ?? []).map((p) => p.id);
    const prices = await getMinPricesByProductId(supabase, productIds);

    const products: CatalogueCardProduct[] = (data ?? []).map((p: any) => ({
      ...p,
      specHighlights: mapSpecHighlights(p.specs),
      startingPrice: prices.get(p.id)?.price ?? null,
      priceVerificationStatus: prices.get(p.id)?.verification_status ?? null,
    }));

    return { products, total: count ?? 0, priceDataLimited: false };
  }

  // Price bucket or price sort requested — needs every matching product's
  // price before we can filter/sort/paginate. Capped for scale; see
  // PRICE_SORT_FETCH_CAP. A larger catalog needs a SQL-level min_price
  // view instead of this in-memory approach.
  const { data, error } = await query.range(0, PRICE_SORT_FETCH_CAP - 1);
  if (error) throw error;

  const allIds = (data ?? []).map((p) => p.id);
  const prices = await getMinPricesByProductId(supabase, allIds);

  let withPrices: CatalogueCardProduct[] = (data ?? []).map((p: any) => ({
    ...p,
    specHighlights: mapSpecHighlights(p.specs),
    startingPrice: prices.get(p.id)?.price ?? null,
    priceVerificationStatus: prices.get(p.id)?.verification_status ?? null,
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
