import Image from "next/image";
import Link from "next/link";
import { ImageOff, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceFreshness } from "./price-freshness";
import { PriceDropBadge } from "./price-drop-badge";
import { formatINR } from "@/lib/catalogue/format";
import type { DealEntry } from "@/lib/db/deals";

export function DealCard({ deal }: { deal: DealEntry }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
            {deal.image ? (
              <Image src={deal.image} alt={deal.product.name} fill sizes="64px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageOff className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="flex-1">
            {deal.brand && <p className="text-caption text-muted-foreground">{deal.brand.name}</p>}
            <Link href={`/smartphones/${deal.product.slug}`} className="text-small font-medium hover:text-primary">
              {deal.product.name}
            </Link>
            <p className="text-caption text-muted-foreground">
              {[deal.variant.ram, deal.variant.storage].filter(Boolean).join(" / ")} · {deal.retailer.name}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-h3 font-semibold">{formatINR(deal.price)}</span>
              {deal.mrp && deal.discountPercent && (
                <span className="text-caption text-muted-foreground">
                  <span className="line-through">{formatINR(deal.mrp)}</span> {deal.discountPercent}% off
                </span>
              )}
            </div>
            {deal.drop && <PriceDropBadge drop={deal.drop} />}
          </div>
          <Button asChild size="sm" variant="outline">
            <a href={deal.productUrl} target="_blank" rel="noopener noreferrer nofollow">
              View Deal <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <PriceFreshness observedAt={deal.lastCheckedAt} verificationStatus={deal.verificationStatus} />
      </CardContent>
    </Card>
  );
}
