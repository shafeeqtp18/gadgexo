import type { CatalogueFilters, CatalogueSort, PriceBucketValue } from "./types";

const VALID_SORTS: CatalogueSort[] = ["relevance", "newest", "price-low", "price-high", "name-asc", "name-desc"];

export function parseCatalogueSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogueFilters {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const csv = (key: string) => {
    const v = get(key);
    return v ? v.split(",").filter(Boolean) : [];
  };

  const sortParam = get("sort");
  const sort: CatalogueSort = VALID_SORTS.includes(sortParam as CatalogueSort)
    ? (sortParam as CatalogueSort)
    : "relevance";

  const page = Math.max(1, parseInt(get("page") ?? "1", 10) || 1);

  return {
    q: get("q")?.trim() || undefined,
    brands: csv("brand"),
    ram: csv("ram"),
    storage: csv("storage"),
    priceBucket: (get("price") as PriceBucketValue) || undefined,
    sort,
    page,
  };
}

/** Builds a /smartphones?... URL from a filters object, merged with optional overrides. Omits empty/default params for clean URLs. */
export function buildCatalogueUrl(filters: CatalogueFilters, overrides: Partial<CatalogueFilters> = {}): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.q) params.set("q", merged.q);
  if (merged.brands.length) params.set("brand", merged.brands.join(","));
  if (merged.ram.length) params.set("ram", merged.ram.join(","));
  if (merged.storage.length) params.set("storage", merged.storage.join(","));
  if (merged.priceBucket) params.set("price", merged.priceBucket);
  if (merged.sort !== "relevance") params.set("sort", merged.sort);
  if (merged.page > 1) params.set("page", String(merged.page));

  const qs = params.toString();
  return qs ? `/smartphones?${qs}` : "/smartphones";
}

export function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function hasActiveFilters(filters: CatalogueFilters): boolean {
  return Boolean(filters.q || filters.brands.length || filters.ram.length || filters.storage.length || filters.priceBucket);
}

export function activeFilterCount(filters: CatalogueFilters): number {
  return filters.brands.length + filters.ram.length + filters.storage.length + (filters.priceBucket ? 1 : 0);
}
