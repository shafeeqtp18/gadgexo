import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATALOGUE_PAGE_SIZE } from "@/lib/catalogue/types";
import { buildCatalogueUrl } from "@/lib/catalogue/url";
import type { CatalogueFilters } from "@/lib/catalogue/types";
import { cn } from "@/lib/utils/cn";

export function CataloguePagination({ filters, total }: { filters: CatalogueFilters; total: number }) {
  const totalPages = Math.max(1, Math.ceil(total / CATALOGUE_PAGE_SIZE));
  if (totalPages <= 1) return null;

  const current = filters.page;
  const pages = [...new Set([1, current - 1, current, current + 1, totalPages].filter((p) => p >= 1 && p <= totalPages))].sort(
    (a, b) => a - b,
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-6">
      <Link
        href={buildCatalogueUrl(filters, { page: Math.max(1, current - 1) })}
        aria-disabled={current === 1}
        className={cn("flex h-9 w-9 items-center justify-center rounded-md border border-border", current === 1 && "pointer-events-none opacity-40")}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Link>

      {pages.map((page, i) => (
        <React.Fragment key={page}>
          {i > 0 && pages[i - 1] !== page - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Link
            href={buildCatalogueUrl(filters, { page })}
            aria-current={page === current ? "page" : undefined}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border text-small",
              page === current ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border",
            )}
          >
            {page}
          </Link>
        </React.Fragment>
      ))}

      <Link
        href={buildCatalogueUrl(filters, { page: Math.min(totalPages, current + 1) })}
        aria-disabled={current === totalPages}
        className={cn("flex h-9 w-9 items-center justify-center rounded-md border border-border", current === totalPages && "pointer-events-none opacity-40")}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
