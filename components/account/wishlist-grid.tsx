"use client";

import * as React from "react";
import { X } from "lucide-react";
import { ProductCard } from "@/components/data-display/product-card";
import { removeFromWishlistAction } from "@/lib/actions/wishlist";
import type { WishlistCardProduct } from "@/lib/db/wishlist";

export function WishlistGrid({ items }: { items: WishlistCardProduct[] }) {
  const [products, setProducts] = React.useState(items);

  async function handleRemove(productId: string) {
    setProducts((prev) => prev.filter((p) => p.id !== productId)); // optimistic
    const result = await removeFromWishlistAction(productId);
    if (result.error) setProducts(items); // revert to last known-good on failure
  }

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className="relative">
          <button
            type="button"
            onClick={() => handleRemove(product.id)}
            aria-label={`Remove ${product.name} from wishlist`}
            className="absolute right-2 top-2 z-10 rounded-full border border-border bg-surface-elevated p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
