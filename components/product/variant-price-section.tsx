"use client";

import * as React from "react";
import { AvailabilityBadge } from "@/components/data-display/status-indicator";
import { RetailerPriceList } from "@/components/pricing/retailer-price-list";
import { cn } from "@/lib/utils/cn";
import type { DetailVariant } from "@/lib/db/product-detail";

export function VariantPriceSection({ variants }: { variants: DetailVariant[] }) {
  const [selectedId, setSelectedId] = React.useState(variants[0]?.id);
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  if (!selected) return null;

  const hasMultipleVariants = variants.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {hasMultipleVariants && (
        <div>
          <p className="mb-2 text-small font-medium">Variant</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select variant">
            {variants.map((v) => {
              const label = [v.ram, v.storage, v.color].filter(Boolean).join(" · ") || v.model_number || "Variant";
              const active = v.id === selectedId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedId(v.id)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-small transition-colors",
                    active ? "border-primary bg-primary/10 font-medium text-primary" : "border-border hover:border-primary/40",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <RetailerPriceList prices={selected.prices} priceHistory={selected.priceHistory} />

      <div className="flex items-center gap-2">
        <AvailabilityBadge status={selected.availability as any} />
        {selected.model_number && <span className="text-caption text-muted-foreground">Model: {selected.model_number}</span>}
      </div>
    </div>
  );
}
