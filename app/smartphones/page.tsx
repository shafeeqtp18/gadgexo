import type { Metadata } from "next";
import { getCatalogueFilterOptions, listCatalogueProducts } from "@/lib/db/catalogue";
import { parseCatalogueSearchParams } from "@/lib/catalogue/url";
import { CatalogueHeader } from "@/components/catalogue/catalogue-header";
import { CatalogueSearch } from "@/components/catalogue/catalogue-search";
import { SortSelect } from "@/components/catalogue/sort-select";
import { FilterPanel } from "@/components/catalogue/filter-panel";
import { FilterDrawer } from "@/components/catalogue/filter-drawer";
import { ActiveFilters } from "@/components/catalogue/active-filters";
import { CataloguePagination } from "@/components/catalogue/pagination";
import { CompareProvider, CompareBar } from "@/components/catalogue/compare";
import { ProductCard } from "@/components/data-display/product-card";
import { Container, Section } from "@/components/layout/primitives";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Smartphones — Compare specs, prices & more",
  description: "Browse smartphones by brand, RAM, storage and price. Compare specifications and see verification status for every listing.",
  // Filter/sort/page combinations aren't indexed individually — avoids the
  // low-quality-URL problem the Phase 5 brief calls out. The canonical
  // catalogue URL is the one worth indexing.
  alternates: { canonical: "/smartphones" },
};

export default async function SmartphonesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseCatalogueSearchParams(searchParams);

  let options;
  let result;
  let loadError = false;

  try {
    [options, result] = await Promise.all([getCatalogueFilterOptions(), listCatalogueProducts(filters)]);
  } catch {
    loadError = true;
  }

  if (loadError || !options || !result) {
    return (
      <Section className="py-10">
        <Container>
          <ErrorState
            title="Couldn't load smartphones"
            description="Something went wrong loading the catalogue. Please try again."
          />
        </Container>
      </Section>
    );
  }

  const { products, total, priceDataLimited } = result;

  return (
    <CompareProvider>
      <Section className="py-6 sm:py-10">
        <Container>
          <div className="flex flex-col gap-6">
            <CatalogueHeader total={total} q={filters.q} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md flex-1">
                <CatalogueSearch filters={filters} />
              </div>
              <div className="flex items-center gap-2">
                <FilterDrawer filters={filters} options={options} />
                <SortSelect filters={filters} />
              </div>
            </div>

            <ActiveFilters filters={filters} options={options} />

            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
              <aside className="hidden lg:block">
                <FilterPanel filters={filters} options={options} />
              </aside>

              <div>
                {products.length === 0 ? (
                  <EmptyState
                    icon={SearchX}
                    title="No smartphones found"
                    description="Try a different search term or clear some filters."
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={{ ...product, showCompare: true }} />
                      ))}
                    </div>
                    <CataloguePagination filters={filters} total={total} />
                    {priceDataLimited && (
                      <p className="pt-4 text-caption text-muted-foreground">
                        Price-based sorting currently considers a limited batch of matching products — this will
                        expand automatically as pagination scales in a future update.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <CompareBar />
    </CompareProvider>
  );
}
