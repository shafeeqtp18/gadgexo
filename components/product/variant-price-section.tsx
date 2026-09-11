"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge } from "@/components/data-display/status-indicator";
import { formatINR } from "@/lib/catalogue/format";
import { formatRelativeTime } from "@/lib/catalogue/spec-format";
import { cn } from "@/lib/utils/cn";
import type { DetailVariant } from "@/lib/db/product-detail";

export function VariantPriceSection({ variants }: { variants: DetailVariant[] }) {
  const [selectedId, setSelectedId] = React.useState(variants[0]?.id);
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  if (!selected) return null;

  const inStockPrices = selected.prices.filter((p) => p.availability === "in_stock").sort((a, b) => a.price - b.price);
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

      <div className="rounded-lg border border-border p-4">
        {inStockPrices.length === 0 ? (
          <p className="text-body text-muted-foreground">Price unavailable</p>
        ) : (
          <div className="flex flex-col gap-3">
            {inStockPrices.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-small font-medium">{p.retailer.name}</p>
                  <p className="text-caption text-muted-foreground">
                    Last checked {formatRelativeTime(p.last_checked_at)}
                    {p.verification_status === "unverified" && " · demo price, not verified"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-h3 font-semibold">{formatINR(p.price)}</p>
                    {p.mrp && p.discount_percent && (
                      <p className="text-caption text-muted-foreground">
                        <span className="line-through">{formatINR(p.mrp)}</span> ({p.discount_percent}% off)
                      </p>
                    )}
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a href={p.product_url} target="_blank" rel="noopener noreferrer nofollow">
                      Visit <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <AvailabilityBadge status={selected.availability as any} />
        {selected.model_number && <span className="text-caption text-muted-foreground">Model: {selected.model_number}</span>}
      </div>
    </div>
  );
}
