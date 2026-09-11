import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceFreshness } from "./price-freshness";
import { PriceDropBadge } from "./price-drop-badge";
import { formatINR } from "@/lib/catalogue/format";
import { computePriceDrop } from "@/lib/catalogue/price-drop";
import type { DetailPrice } from "@/lib/db/product-detail";

export function RetailerPriceList({
  prices,
  priceHistory = [],
}: {
  prices: DetailPrice[];
  priceHistory?: { price: number; recorded_at: string }[];
}) {
  const inStock = [...prices].filter((p) => p.availability === "in_stock").sort((a, b) => a.price - b.price);
  const other = prices.filter((p) => p.availability !== "in_stock");

  if (prices.length === 0) {
    return <p className="text-body text-muted-foreground">No verified price available yet.</p>;
  }

  const best = inStock[0];

  return (
    <div className="flex flex-col gap-3">
      {best && (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
          <p className="mb-1 text-caption font-medium text-primary">Best Price</p>
          <PriceRow price={best} priceHistory={priceHistory} />
        </div>
      )}

      {inStock.length > 1 && (
        <div>
          <p className="mb-2 text-small font-medium">Other Retailers</p>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {inStock.slice(1).map((p) => (
              <div key={p.id} className="p-3">
                <PriceRow price={p} priceHistory={priceHistory} />
              </div>
            ))}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border opacity-70">
          {other.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-small font-medium">{p.retailer.name}</p>
                <p className="text-caption text-muted-foreground capitalize">{p.availability.replace("_", " ")}</p>
              </div>
              <span className="text-small">{formatINR(p.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceRow({ price, priceHistory }: { price: DetailPrice; priceHistory: { price: number; recorded_at: string }[] }) {
  const drop = computePriceDrop(price.price, priceHistory);

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-small font-medium">{price.retailer.name}</p>
        <PriceFreshness observedAt={price.last_checked_at} verificationStatus={price.verification_status} />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-h3 font-semibold">{formatINR(price.price)}</p>
          <div className="flex items-center justify-end gap-2">
            {price.mrp && price.discount_percent && (
              <span className="text-caption text-muted-foreground">
                <span className="line-through">{formatINR(price.mrp)}</span> ({price.discount_percent}% off)
              </span>
            )}
            {drop && <PriceDropBadge drop={drop} compact />}
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={price.product_url} target="_blank" rel="noopener noreferrer nofollow">
            Visit <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </div>
  );
}
