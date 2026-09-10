import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationBadge } from "@/components/data-display/status-indicator";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  verification_status: string;
  brand: { name: string } | null;
  images: Array<{ image_url: string; is_primary: boolean }>;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  return (
    <Link href={`/smartphones/${product.slug}`} className="block h-full">
      <Card variant="interactive" className="flex h-full flex-col overflow-hidden">
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
        </div>
        <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
          {product.brand && <p className="text-caption text-muted-foreground">{product.brand.name}</p>}
          <h3 className="text-small font-medium leading-snug">{product.name}</h3>
          <div className="mt-auto pt-1">
            <VerificationBadge status={product.verification_status as any} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
