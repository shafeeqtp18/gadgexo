"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { ComparisonTable } from "./comparison-table";
import { KeyDifferences } from "./key-differences";
import { AddProductSearch } from "./add-product-search";
import { Button } from "@/components/ui/button";
import { removeProductFromComparison, addProductToComparison, clearComparison } from "@/lib/actions/compare";
import type { ComparisonGroup, QuickHighlight } from "@/lib/catalogue/compare-engine";
import type { ProductDetail } from "@/lib/db/product-detail";

export function TokenComparisonClient({
  token,
  products,
  groups,
  quickHighlights,
}: {
  token: string;
  products: ProductDetail[];
  groups: ComparisonGroup[];
  quickHighlights: QuickHighlight[];
}) {
  const [copied, setCopied] = React.useState(false);
  const [confirmingClear, setConfirmingClear] = React.useState(false);
  const [addError, setAddError] = React.useState<string | null>(null);

  async function handleAdd(productId: string) {
    const result = await addProductToComparison(token, productId);
    if (result.error) setAddError(result.error);
    else setAddError(null);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Link copied" : "Copy share link"}
        </Button>

        {confirmingClear ? (
          <div className="flex items-center gap-2 text-small">
            <span>Clear this comparison?</span>
            <form action={clearComparison.bind(null, token)}>
              <Button size="sm" variant="destructive" type="submit">Yes, clear</Button>
            </form>
            <Button size="sm" variant="ghost" onClick={() => setConfirmingClear(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmingClear(true)}>Clear comparison</Button>
        )}
      </div>

      <KeyDifferences groups={groups} productNames={products.map((p) => p.name)} />

      <ComparisonTable
        products={products}
        groups={groups}
        quickHighlights={quickHighlights}
        onRemove={(id) => removeProductFromComparison(token, id)}
      />

      {products.length < 4 && (
        <div className="max-w-sm">
          <AddProductSearch excludeIds={products.map((p) => p.id)} onAdd={handleAdd} />
          {addError && <p className="mt-1 text-caption text-error">{addError}</p>}
        </div>
      )}
    </div>
  );
}
