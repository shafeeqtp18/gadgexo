"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/db/account";

export interface WishlistActionResult {
  error?: string;
  authRequired?: boolean;
}

async function getOrCreateWishlistId(supabase: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data: existing } = await supabase.from("wishlists").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase.from("wishlists").insert({ user_id: userId }).select("id").single();
  if (error) throw error;
  return created.id;
}

export async function addToWishlistAction(productId: string): Promise<WishlistActionResult> {
  const user = await getCurrentUser();
  if (!user) return { authRequired: true };

  const supabase = createClient();
  const wishlistId = await getOrCreateWishlistId(supabase, user.id);

  // unique(wishlist_id, product_id) at the DB level is the real duplicate
  // guard — this insert is simply a no-op-safe attempt on top of it.
  const { error } = await supabase.from("wishlist_items").insert({ wishlist_id: wishlistId, product_id: productId });
  if (error && error.code !== "23505") return { error: "Couldn't save this product. Please try again." };

  revalidatePath("/account/wishlist");
  return {};
}

export async function removeFromWishlistAction(productId: string): Promise<WishlistActionResult> {
  const user = await getCurrentUser();
  if (!user) return { authRequired: true };

  const supabase = createClient();
  const { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", user.id).maybeSingle();
  if (!wishlist) return {};

  const { error } = await supabase.from("wishlist_items").delete().eq("wishlist_id", wishlist.id).eq("product_id", productId);
  if (error) return { error: error.message };

  revalidatePath("/account/wishlist");
  return {};
}
