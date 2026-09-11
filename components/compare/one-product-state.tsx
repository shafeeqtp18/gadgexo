"use client";

import * as React from "react";
import { ComparisonColumnHeader } from "./product-column-header";
import { AddProductSearch } from "./add-product-search";
import { Button } from "@/components/ui/button";
import { addProductToComparison } from "@/lib/actions/compare";
import type { ProductDetail } from "@/lib/db/product-detail";

export function OneProductState({ token, product }: { token: string; product: ProductDetail }) {
  const [error, setError] = React.useState<string | null>(null);

  async function handleAdd(productId: string) {
    const result = await addProductToComparison(token, productId);
    setError(result.error ?? null);
  }

  return (
    <div className="flex flex-col gap-6">
      <ComparisonColumnHeader product={product} />
      <p className="text-small text-muted-foreground">Add one more gadget to compare.</p>
      <div className="flex flex-col gap-2 max-w-sm">
        <AddProductSearch excludeIds={[product.id]} onAdd={handleAdd} />
        {error && <p className="text-caption text-error">{error}</p>}
      </div>
      <Button asChild variant="outline" className="w-fit">
        <a href="/smartphones">Browse Smartphones</a>
      </Button>
    </div>
  );
}
