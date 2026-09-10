"use client";

import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { PRICE_BUCKETS, type CatalogueFilterOptions, type CatalogueFilters } from "@/lib/catalogue/types";
import { buildCatalogueUrl, toggleInList } from "@/lib/catalogue/url";

export function FilterPanel({
  filters,
  options,
  onNavigate,
}: {
  filters: CatalogueFilters;
  options: CatalogueFilterOptions;
  onNavigate?: () => void; // closes the mobile drawer after a change
}) {
  const router = useRouter();

  function go(overrides: Partial<CatalogueFilters>) {
    router.push(buildCatalogueUrl(filters, { ...overrides, page: 1 }));
    onNavigate?.();
  }

  return (
    <div className="flex flex-col gap-6">
      {options.brands.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-small font-semibold">Brand</legend>
          <div className="flex flex-col gap-2">
            {options.brands.map((brand) => (
              <label key={brand.slug} className="flex items-center gap-2 text-small">
                <Checkbox
                  checked={filters.brands.includes(brand.slug)}
                  onCheckedChange={() => go({ brands: toggleInList(filters.brands, brand.slug) })}
                />
                {brand.name} <span className="text-caption text-muted-foreground">({brand.count})</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {options.ram.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-small font-semibold">RAM</legend>
          <div className="flex flex-col gap-2">
            {options.ram.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-small">
                <Checkbox
                  checked={filters.ram.includes(r.value)}
                  onCheckedChange={() => go({ ram: toggleInList(filters.ram, r.value) })}
                />
                {r.value} <span className="text-caption text-muted-foreground">({r.count})</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {options.storage.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-small font-semibold">Storage</legend>
          <div className="flex flex-col gap-2">
            {options.storage.map((s) => (
              <label key={s.value} className="flex items-center gap-2 text-small">
                <Checkbox
                  checked={filters.storage.includes(s.value)}
                  onCheckedChange={() => go({ storage: toggleInList(filters.storage, s.value) })}
                />
                {s.value} <span className="text-caption text-muted-foreground">({s.count})</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-small font-semibold">Price</legend>
        <RadioGroup
          value={filters.priceBucket ?? ""}
          onValueChange={(value) => go({ priceBucket: (value || undefined) as CatalogueFilters["priceBucket"] })}
          className="flex flex-col gap-2"
        >
          {PRICE_BUCKETS.map((bucket) => (
            <label key={bucket.value} className="flex items-center gap-2 text-small">
              <RadioGroupItem value={bucket.value} />
              {bucket.label}
            </label>
          ))}
        </RadioGroup>
        {filters.priceBucket && (
          <button
            type="button"
            className="mt-2 text-caption text-primary"
            onClick={() => go({ priceBucket: undefined })}
          >
            Clear price filter
          </button>
        )}
      </fieldset>

      <Button variant="outline" size="sm" onClick={() => go({ brands: [], ram: [], storage: [], priceBucket: undefined, q: undefined })}>
        Clear all filters
      </Button>
    </div>
  );
}
