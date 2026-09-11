import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationBadge, AvailabilityBadge } from "@/components/data-display/status-indicator";
import { CompareCheckbox } from "@/components/catalogue/compare";
import { PriceDropBadge } from "@/components/pricing/price-drop-badge";
import { formatINR } from "@/lib/catalogue/format";
import type { PriceDrop } from "@/lib/catalogue/price-drop";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  verification_status: string;
  brand: { name: string } | null;
  images: Array<{ image_url: string; is_primary: boolean }>;
  variants?: Array<{ ram: string | null; storage: string | null; availability: string }>;
  specHighlights?: Array<{ label: string; value: string }>;
  startingPrice?: number | null;
  priceVerificationStatus?: string | null;
  priceDrop?: PriceDrop | null;
  showCompare?: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const baseVariant = product.variants?.[0];

  return (
    <Card variant="interactive" className="flex h-full flex-col overflow-hidden">
      <Link href={`/smartphones/${product.slug}`} className="block">
        <div className="relative aspect-square w-full bg-surface-elevated">
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
          {baseVariant?.availability && baseVariant.availability !== "in_stock" && (
            <div className="absolute left-2 top-2">
              <AvailabilityBadge status={baseVariant.availability as any} />
            </div>
          )}
          {product.priceDrop && (
            <div className="absolute right-2 top-2">
              <PriceDropBadge drop={product.priceDrop} compact />
            </div>
          )}
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
        {product.brand && <p className="text-caption text-muted-foreground">{product.brand.name}</p>}
        <Link href={`/smartphones/${product.slug}`}>
          <h3 className="text-small font-medium leading-snug hover:text-primary">{product.name}</h3>
        </Link>

        {(baseVariant?.ram || baseVariant?.storage) && (
          <p className="text-caption text-muted-foreground">
            {[baseVariant?.ram, baseVariant?.storage].filter(Boolean).join(" / ")}
          </p>
        )}

        {product.specHighlights && product.specHighlights.length > 0 && (
          <ul className="flex flex-col gap-0.5 text-caption text-muted-foreground">
            {product.specHighlights.slice(0, 2).map((spec) => (
              <li key={spec.label}>{spec.label}: {spec.value}</li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          {product.startingPrice !== undefined && (
            <div className="flex items-baseline gap-1.5">
              {product.startingPrice !== null ? (
                <>
                  <span className="text-small font-semibold">{formatINR(product.startingPrice)}</span>
                  {product.priceVerificationStatus === "unverified" && (
                    <span className="text-caption text-muted-foreground">(demo price)</span>
                  )}
                </>
              ) : (
                <span className="text-caption text-muted-foreground">Price unavailable</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <VerificationBadge status={product.verification_status as any} />
            {product.showCompare && (
              <CompareCheckbox product={{ id: product.id, name: product.name, slug: product.slug }} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
