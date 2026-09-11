"use client";

import * as React from "react";
import Image from "next/image";

import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ProductImage = {
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
};

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const sorted = [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary),
  );

  const [activeIndex, setActiveIndex] = React.useState(0);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-surface-elevated text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <ImageOff
            className="h-10 w-10"
            aria-hidden="true"
          />
          <span className="text-caption">
            Image unavailable
          </span>
        </div>
      </div>
    );
  }

  const active = sorted[activeIndex];

  if (!active) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-surface-elevated text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <ImageOff
            className="h-10 w-10"
            aria-hidden="true"
          />
          <span className="text-caption">
            Image unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface-elevated">
        <Image
          key={active.image_url}
          src={active.image_url}
          alt={active.alt_text || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {sorted.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Product images"
        >
          {sorted.map((img, i) => (
            <button
              key={img.image_url}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`View image ${i + 1} of ${sorted.length}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2",
                i === activeIndex
                  ? "border-primary"
                  : "border-border opacity-70",
              )}
            >
              <Image
                src={img.image_url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
