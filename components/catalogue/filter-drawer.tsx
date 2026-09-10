"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/overlays/sheet";
import { FilterPanel } from "./filter-panel";
import { activeFilterCount } from "@/lib/catalogue/url";
import type { CatalogueFilterOptions, CatalogueFilters } from "@/lib/catalogue/types";

export function FilterDrawer({ filters, options }: { filters: CatalogueFilters; options: CatalogueFilterOptions }) {
  const [open, setOpen] = React.useState(false);
  const count = activeFilterCount(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters {count > 0 && `(${count})`}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <FilterPanel filters={filters} options={options} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
