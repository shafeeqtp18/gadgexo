import { createClient } from "@/lib/supabase/server";

export interface DetailSource {
  id: string;
  name: string;
  source_type: string;
  domain: string | null;
}

export interface DetailPrice {
  id: string;
  price: number;
  mrp: number | null;
  discount_percent: number | null;
  currency: string;
  product_url: string;
  availability: string;
  verification_status: string;
  last_checked_at: string;
  retailer: { name: string; slug: string; website_url: string | null };
  source: DetailSource | null;
}

export interface DetailVariant {
  id: string;
  ram: string | null;
  storage: string | null;
  storage_type: string | null;
  color: string | null;
  color_hex: string | null;
  region: string | null;
  model_number: string | null;
  sku: string | null;
  availability: string;
  prices: DetailPrice[];
  priceHistory: { price: number; mrp: number | null; recorded_at: string }[];
}

export interface DetailSpecRow {
  id: string;
  name: string;
  slug: string;
  unit: string | null;
  value: string;
  verification_status: string;
  source: DetailSource | null;
}

export interface DetailSpecGroup {
  id: string;
  name: string;
  sort_order: number;
  specs: DetailSpecRow[];
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  model_identifier: string | null;
  short_description: string | null;
  description: string | null;
  status: string;
  verification_status: string;
  release_date: string | null;
  india_release_date: string | null;
  updated_at: string;
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  images: { image_url: string; alt_text: string | null; is_primary: boolean }[];
  variants: DetailVariant[];
  specGroups: DetailSpecGroup[];
  sources: DetailSource[]; // distinct sources referenced by this product's specs/prices
}

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const supabase = createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      id, name, slug, model_identifier, short_description, description, status,
      verification_status, release_date, india_release_date, updated_at,
      brand:brands(id, name, slug),
      category:categories(id, name, slug),
      images:product_images(image_url, alt_text, is_primary)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (productError) throw productError;
  if (!product) return null;

  const [variantsRes, specsRes] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, ram, storage, storage_type, color, color_hex, region, model_number, sku, availability")
      .eq("product_id", product.id),
    supabase
      .from("product_specifications")
      .select(`
        value, verification_status, source_id,
        specification:specifications(id, name, slug, unit, group:specification_groups(id, name, sort_order))
      `)
      .eq("product_id", product.id),
  ]);
  if (variantsRes.error) throw variantsRes.error;
  if (specsRes.error) throw specsRes.error;

  const variantIds = (variantsRes.data ?? []).map((v) => v.id);
  const sourceIds = new Set<string>();
  for (const s of specsRes.data ?? []) if (s.source_id) sourceIds.add(s.source_id);

  let pricesData: any[] = [];
  let historyData: any[] = [];

  if (variantIds.length > 0) {
    const [pricesRes, historyRes] = await Promise.all([
      supabase
        .from("prices")
        .select(`
          id, variant_id, price, mrp, discount_percent, currency, product_url,
          availability, verification_status, last_checked_at, source_id,
          retailer:retailers(name, slug, website_url)
        `)
        .in("variant_id", variantIds),
      supabase
        .from("price_history")
        .select("variant_id, price, mrp, recorded_at, source_id")
        .in("variant_id", variantIds)
        .order("recorded_at", { ascending: true }),
    ]);
    if (pricesRes.error) throw pricesRes.error;
    if (historyRes.error) throw historyRes.error;
    pricesData = pricesRes.data ?? [];
    historyData = historyRes.data ?? [];

    for (const p of pricesData) if (p.source_id) sourceIds.add(p.source_id);
    for (const h of historyData) if (h.source_id) sourceIds.add(h.source_id);
  }

  // Resolve every source referenced by specs + prices + history in one go.
  const sourceMap = await resolveSources(supabase, [...sourceIds]);

  const pricesByVariant = new Map<string, DetailPrice[]>();
  for (const p of pricesData) {
    const list = pricesByVariant.get(p.variant_id) ?? [];
    list.push({
      id: p.id,
      price: p.price,
      mrp: p.mrp,
      discount_percent: p.discount_percent,
      currency: p.currency,
      product_url: p.product_url,
      availability: p.availability,
      verification_status: p.verification_status,
      last_checked_at: p.last_checked_at,
      retailer: p.retailer as any,
      source: p.source_id ? sourceMap.get(p.source_id) ?? null : null,
    });
    pricesByVariant.set(p.variant_id, list);
  }

  const historyByVariant = new Map<string, { price: number; mrp: number | null; recorded_at: string }[]>();
  for (const h of historyData) {
    const list = historyByVariant.get(h.variant_id) ?? [];
    list.push({ price: h.price, mrp: h.mrp, recorded_at: h.recorded_at });
    historyByVariant.set(h.variant_id, list);
  }

  const variants: DetailVariant[] = (variantsRes.data ?? []).map((v) => ({
    ...v,
    prices: pricesByVariant.get(v.id) ?? [],
    priceHistory: historyByVariant.get(v.id) ?? [],
  }));

  const groupMap = new Map<string, DetailSpecGroup>();
  for (const row of specsRes.data ?? []) {
    const spec: any = row.specification;
    const group = spec.group;
    if (!groupMap.has(group.id)) groupMap.set(group.id, { id: group.id, name: group.name, sort_order: group.sort_order, specs: [] });
    groupMap.get(group.id)!.specs.push({
      id: spec.id,
      name: spec.name,
      slug: spec.slug,
      unit: spec.unit,
      value: row.value,
      verification_status: row.verification_status,
      source: row.source_id ? sourceMap.get(row.source_id) ?? null : null,
    });
  }
  const specGroups = [...groupMap.values()].sort((a, b) => a.sort_order - b.sort_order);

  return {
    ...product,
    brand: product.brand as any,
    category: product.category as any,
    images: product.images ?? [],
    variants,
    specGroups,
    sources: [...sourceMap.values()],
  };
}

async function resolveSources(supabase: ReturnType<typeof createClient>, ids: string[]): Promise<Map<string, DetailSource>> {
  const map = new Map<string, DetailSource>();
  if (ids.length === 0) return map;
  const { data, error } = await supabase.from("sources").select("id, name, source_type, domain").in("id", ids);
  if (error) throw error;
  for (const s of data ?? []) map.set(s.id, s);
  return map;
}

/** Same brand first, then same category, excluding the product itself — never a fabricated "similarity score". */
export async function getRelatedProducts(productId: string, brandId: string | null, categoryId: string | null, limit = 4) {
  const supabase = createClient();
  const select = "id, name, slug, verification_status, brand:brands(name), images:product_images(image_url, is_primary)";

  const results: any[] = [];
  const seen = new Set([productId]);

  if (brandId) {
    const { data } = await supabase
      .from("products")
      .select(select)
      .eq("status", "published")
      .eq("brand_id", brandId)
      .neq("id", productId)
      .limit(limit);
    for (const p of data ?? []) if (!seen.has(p.id)) { results.push(p); seen.add(p.id); }
  }

  if (results.length < limit && categoryId) {
    const { data } = await supabase
      .from("products")
      .select(select)
      .eq("status", "published")
      .eq("category_id", categoryId)
      .neq("id", productId)
      .limit(limit - results.length + seen.size);
    for (const p of data ?? []) {
      if (results.length >= limit) break;
      if (!seen.has(p.id)) { results.push(p); seen.add(p.id); }
    }
  }

  return results.slice(0, limit);
}
