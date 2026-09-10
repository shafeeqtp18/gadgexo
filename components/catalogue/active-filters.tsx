"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PRICE_BUCKETS, type CatalogueFilterOptions, type CatalogueFilters } from "@/lib/catalogue/types";
import { buildCatalogueUrl, hasActiveFilters, toggleInList } from "@/lib/catalogue/url";

export function ActiveFilters({ filters, options }: { filters: CatalogueFilters; options: CatalogueFilterOptions }) {
  const router = useRouter();
  if (!hasActiveFilters(filters)) return null;

  function go(overrides: Partial<CatalogueFilters>) {
    router.push(buildCatalogueUrl(filters, { ...overrides, page: 1 }));
  }

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.q) chips.push({ key: "q", label: `"${filters.q}"`, onRemove: () => go({ q: undefined }) });
  for (const slug of filters.brands) {
    const brand = options.brands.find((b) => b.slug === slug);
    chips.push({ key: `brand-${slug}`, label: brand?.name ?? slug, onRemove: () => go({ brands: toggleInList(filters.brands, slug) }) });
  }
  for (const r of filters.ram) chips.push({ key: `ram-${r}`, label: `${r} RAM`, onRemove: () => go({ ram: toggleInList(filters.ram, r) }) });
  for (const s of filters.storage) chips.push({ key: `storage-${s}`, label: s, onRemove: () => go({ storage: toggleInList(filters.storage, s) }) });
  if (filters.priceBucket) {
    const bucket = PRICE_BUCKETS.find((b) => b.value === filters.priceBucket);
    chips.push({ key: "price", label: bucket?.label ?? filters.priceBucket, onRemove: () => go({ priceBucket: undefined }) });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-3 py-1 text-caption"
        >
          {chip.label}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => go({ q: undefined, brands: [], ram: [], storage: [], priceBucket: undefined })}
        className="text-caption text-primary underline"
      >
        Clear all
      </button>
    </div>
  );
}
