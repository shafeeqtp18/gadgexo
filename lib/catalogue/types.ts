import type { PriceDrop } from "./price-drop";

export const CATALOGUE_PAGE_SIZE = 12;
export const PRICE_SORT_FETCH_CAP = 500;

export type CatalogueSort =
  | "relevance"
  | "newest"
  | "price-low"
  | "price-high"
  | "name-asc"
  | "name-desc";

export const SORT_OPTIONS: { value: CatalogueSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
];

export const PRICE_BUCKETS = [
  { value: "under-10000", label: "Under ₹10,000", min: 0, max: 10000 },
  { value: "10000-20000", label: "₹10,000 – ₹20,000", min: 10000, max: 20000 },
  { value: "20000-30000", label: "₹20,000 – ₹30,000", min: 20000, max: 30000 },
  { value: "30000-50000", label: "₹30,000 – ₹50,000", min: 30000, max: 50000 },
  { value: "50000-plus", label: "₹50,000+", min: 50000, max: Infinity },
] as const;

export type PriceBucketValue = (typeof PRICE_BUCKETS)[number]["value"];

export interface CatalogueFilters {
  q?: string;
  brands: string[];
  ram: string[];
  storage: string[];
  priceBucket?: PriceBucketValue;
  sort: CatalogueSort;
  page: number;
}

export interface CatalogueFilterOptions {
  brands: { slug: string; name: string; count: number }[];
  ram: { value: string; count: number }[];
  storage: { value: string; count: number }[];
}

export interface CatalogueCardProduct {
  id: string;
  name: string;
  slug: string;
  verification_status: string;
  release_date: string | null;
  brand: { name: string; slug: string } | null;
  images: { image_url: string; is_primary: boolean }[];
  variants: { id: string; ram: string | null; storage: string | null; availability: string }[];
  specHighlights: { label: string; value: string }[];
  startingPrice: number | null;
  priceVerificationStatus: string | null;
  priceDrop: PriceDrop | null;
}
