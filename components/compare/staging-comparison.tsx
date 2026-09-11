"use client";

import * as React from "react";
import { GitCompare } from "lucide-react";
import { useCompare } from "@/components/catalogue/compare";
import { ComparisonColumnHeader } from "./product-column-header";
import { AddProductSearch } from "./add-product-search";
import { getStagingProducts, createComparison } from "@/lib/actions/compare";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import type { ProductDetail } from "@/lib/db/product-detail";

export function StagingComparison() {
  const { items, toggle } = useCompare();
  const [products, setProducts] = React.useState<ProductDetail[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    getStagingProducts(items.map((i) => i.id)).then((res) => {
      setProducts(res);
      setLoading(false);
    });
  }, [items]);

  async function handleAdd(productId: string) {
    const [detail] = await getStagingProducts([productId]);
    if (detail) toggle({ id: detail.id, name: detail.name, slug: detail.slug });
  }

  async function handleCompareNow() {
    setSaving(true);
    setError(null);
    try {
      await createComparison(products.map((p) => p.id));
    } catch (e) {
      // redirect() throws internally on success — only real errors land here
      if (e instanceof Error && e.message) setError(e.message);
      setSaving(false);
    }
  }

  if (loading) return null;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <EmptyState
          icon={GitCompare}
          title="Compare gadgets side by side"
          description="Select at least two smartphones to get started."
        />
        <Button asChild>
          <a href="/smartphones">Explore Smartphones</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        {products.map((product) => (
          <ComparisonColumnHeader key={product.id} product={product} onRemove={() => toggle({ id: product.id, name: product.name, slug: product.slug })} />
        ))}
      </div>

      <div className="max-w-sm">
        <AddProductSearch
          excludeIds={products.map((p) => p.id)}
          onAdd={handleAdd}
          disabled={products.length >= 4}
          disabledReason="You can compare up to 4 gadgets at a time"
        />
      </div>

      {products.length === 1 ? (
        <p className="text-small text-muted-foreground">Add one more gadget to compare.</p>
      ) : (
        <div className="flex items-center gap-3">
          <Button onClick={handleCompareNow} disabled={saving}>
            {saving ? "Preparing comparison…" : "Compare Now"}
          </Button>
          {error && <p className="text-small text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
