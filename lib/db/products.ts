import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductWithDetails,
  SpecificationGroupWithValues,
} from "@/types/domain";

// Columns every homepage card needs — brand name for display, primary
// image, and the cheapest variant's id so a price can be looked up.
// Kept as one shared select string so every homepage query stays in sync.
const CARD_SELECT = `
  id, name, slug, status, verification_status, is_featured, is_trending,
  release_date, india_release_date, updated_at,
  brand:brands(name, slug),
  images:product_images(image_url, is_primary),
  variants:product_variants(id)
`;

export interface ProductListFilters {
  categorySlug?: string;
  brandSlug?: string;
  limit?: number;
  offset?: number;
}

export async function getPublishedProducts(filters: ProductListFilters = {}): Promise<Product[]> {
  const supabase = createClient();
  const { limit = 24, offset = 0 } = filters;
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
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`*, brand:brands(*), category:categories(*), variants:product_variants(*), images:product_images(*)`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (productError) throw productError;
  if (!product) return null;

  const { data: specRows, error: specError } = await supabase
    .from("product_specifications")
    .select("*, specification:specifications(*, group:specification_groups(*))")
    .eq("product_id", product.id);
  if (specError) throw specError;

  return { ...product, specificationGroups: groupSpecifications(specRows ?? []) } as unknown as ProductWithDetails;
}

function groupSpecifications(rows: any[]): SpecificationGroupWithValues[] {
  const byGroup = new Map<string, SpecificationGroupWithValues>();
  for (const row of rows) {
    const { group } = row.specification;
    if (!byGroup.has(group.id)) byGroup.set(group.id, { group, specs: [] });
    byGroup.get(group.id)!.specs.push({ specification: row.specification, value: row });
  }
  return [...byGroup.values()]
    .sort((a, b) => a.group.sort_order - b.group.sort_order)
    .map((g) => ({ ...g, specs: g.specs.sort((a, b) => a.specification.sort_order - b.specification.sort_order) }));
}

/** Homepage "Trending Now" — only products the catalog actually flagged is_trending. */
export async function getTrendingProducts(limit = 8) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("status", "published")
    .eq("is_trending", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** Homepage "Featured" (used instead of an unsupported "Best/Popular" claim — no rating data exists yet). */
export async function getFeaturedProducts(limit = 8) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** Only products with a real release_date — never inventing one. */
export async function getLatestReleases(limit = 8) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("status", "published")
    .not("release_date", "is", null)
    .order("release_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** "Recently Updated" — real updated_at timestamps + real verification_status, nothing fabricated. */
export async function getRecentlyUpdatedProducts(limit = 6) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, verification_status, updated_at, brand:brands(name)")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
