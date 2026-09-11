import Image from "next/image";
import Link from "next/link";
import { ImageOff, X } from "lucide-react";
import { VerificationBadge, AvailabilityBadge } from "@/components/data-display/status-indicator";
import { PriceFreshness } from "@/components/pricing/price-freshness";
import { formatINR } from "@/lib/catalogue/format";
import type { ProductDetail } from "@/lib/db/product-detail";

export function ComparisonColumnHeader({
  product,
  onRemove,
}: {
  product: ProductDetail;
  onRemove?: () => void;
}) {
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];
  const variant = product.variants.filter((v) => v.availability === "in_stock")[0] ?? product.variants[0];
  const variantLabel = variant ? [variant.ram, variant.storage].filter(Boolean).join(" / ") : null;
  const inStockPrices = variant?.prices.filter((p) => p.availability === "in_stock") ?? [];
  const best = [...inStockPrices].sort((a, b) => a.price - b.price)[0];

  return (
    <div className="flex w-44 shrink-0 flex-col gap-2 sm:w-56">
      <div className="relative flex justify-center">
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${product.name} from comparison`}
            className="absolute right-0 top-0 rounded-full border border-border bg-surface-elevated p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
        <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-surface-elevated">
          {primaryImage ? (
            <Image src={primaryImage.image_url} alt={product.name} fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-6 w-6" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        {product.brand && <p className="text-caption text-muted-foreground">{product.brand.name}</p>}
        <Link href={`/smartphones/${product.slug}`} className="text-small font-medium hover:text-primary">
          {product.name}
        </Link>
        {variantLabel && <p className="text-caption text-muted-foreground">{variantLabel}</p>}
      </div>

      <div className="text-center">
        <p className="text-small font-semibold">{best ? formatINR(best.price) : "Price unavailable"}</p>
        {best && (
          <>
            <p className="text-caption text-muted-foreground">from {best.retailer.name}</p>
            <PriceFreshness observedAt={best.last_checked_at} verificationStatus={best.verification_status} />
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <VerificationBadge status={product.verification_status as any} />
        {variant?.availability && <AvailabilityBadge status={variant.availability as any} />}
      </div>
    </div>
  );
}
