"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/search/search-input";
import { buildCatalogueUrl } from "@/lib/catalogue/url";
import type { CatalogueFilters } from "@/lib/catalogue/types";

const DEBOUNCE_MS = 400;

export function CatalogueSearch({ filters }: { filters: CatalogueFilters }) {
  const router = useRouter();
  const [value, setValue] = React.useState(filters.q ?? "");
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  function navigate(q: string) {
    router.push(buildCatalogueUrl(filters, { q: q.trim() || undefined, page: 1 }));
  }

  function handleChange(next: string) {
    setValue(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => navigate(next), DEBOUNCE_MS);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      navigate(value);
    } else if (e.key === "Escape") {
      setValue("");
      navigate("");
    }
  }

  return (
    <SearchInput
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Search smartphones or brands..."
      aria-label="Search smartphones"
    />
  );
}
