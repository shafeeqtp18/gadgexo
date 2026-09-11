import { createClient } from "@/lib/supabase/server";
import { getPriceInfoByProductId } from "./catalogue";

/** Cheap — just the ids, for save-state checks on catalogue/product pages. Returns an empty set for anonymous users without querying anything. */
export async function getWishlistProductIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const supabase = createClient();
  const { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", userId).maybeSingle();
  if (!wishlist) return new Set();

  const { data: items, error } = await supabase.from("wishlist_items").select("product_id").eq("wishlist_id", wishlist.id);
  if (error) throw error;
  return new Set((items ?? []).map((i) => i.product_id));
}

export interface WishlistCardProduct {
  id: string;
  name: string;
  slug: string;
  verification_status: string;
  brand: { name: string } | null;
  images: { image_url: string; is_primary: boolean }[];
  variants: { ram: string | null; storage: string | null; availability: string }[];
  startingPrice: number | null;
  priceVerificationStatus: string | null;
}

export async function getWishlistItems(userId: string): Promise<WishlistCardProduct[]> {
  const supabase = createClient();
  const { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", userId).maybeSingle();
  if (!wishlist) return [];

  const { data: items, error: itemsError } = await supabase.from("wishlist_items").select("product_id").eq("wishlist_id", wishlist.id);
  if (itemsError) throw itemsError;
  const productIds = (items ?? []).map((i) => i.product_id);
  if (productIds.length === 0) return [];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      id, name, slug, verification_status, status,
      brand:brands(name),
      images:product_images(image_url, is_primary),
      variants:product_variants(ram, storage, availability)
    `)
    .in("id", productIds);
  if (productsError) throw productsError;

  // A product may have been unpublished/deleted since it was saved —
  // simply omit it rather than showing broken data.
  const published = (products ?? []).filter((p: any) => p.status === "published");
  const priceInfo = await getPriceInfoByProductId(supabase, published.map((p: any) => p.id));

  return published.map((p: any) => ({
    ...p,
    startingPrice: priceInfo.get(p.id)?.price ?? null,
    priceVerificationStatus: priceInfo.get(p.id)?.verification_status ?? null,
  }));
}
