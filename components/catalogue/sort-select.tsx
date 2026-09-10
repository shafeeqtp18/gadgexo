"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_OPTIONS, type CatalogueFilters } from "@/lib/catalogue/types";
import { buildCatalogueUrl } from "@/lib/catalogue/url";

export function SortSelect({ filters }: { filters: CatalogueFilters }) {
  const router = useRouter();

  return (
    <Select
      value={filters.sort}
      onValueChange={(value) => router.push(buildCatalogueUrl(filters, { sort: value as CatalogueFilters["sort"], page: 1 }))}
    >
      <SelectTrigger className="w-[180px]" aria-label="Sort products">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
