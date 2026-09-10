import { getTrendingProducts, getLatestReleases, getFeaturedProducts } from "@/lib/db/products";
import { ProductSectionShell } from "./product-section-shell";
import { ProductRow, ProductRowItem } from "./product-row";
import { ProductCard } from "@/components/data-display/product-card";

export async function TrendingSection() {
  const products = await getTrendingProducts(8);
  return (
    <ProductSectionShell
      title="Trending Now"
      viewAllHref="/smartphones"
      isEmpty={products.length === 0}
      emptyMessage="No trending products yet — check back once the catalog grows."
    >
      <ProductRow>
        {products.map((p: any) => (
          <ProductRowItem key={p.id}><ProductCard product={p} /></ProductRowItem>
        ))}
      </ProductRow>
    </ProductSectionShell>
  );
}

export async function LatestReleasesSection() {
  const products = await getLatestReleases(8);
  return (
    <ProductSectionShell
      title="Latest Smartphone Releases"
      viewAllHref="/smartphones"
      isEmpty={products.length === 0}
      emptyMessage="No release-date data available yet."
    >
      <ProductRow>
        {products.map((p: any) => (
          <ProductRowItem key={p.id}><ProductCard product={p} /></ProductRowItem>
        ))}
      </ProductRow>
    </ProductSectionShell>
  );
}

export async function FeaturedSection() {
  const products = await getFeaturedProducts(8);
  return (
    <ProductSectionShell
      title="Featured Smartphones"
      viewAllHref="/smartphones"
      isEmpty={products.length === 0}
      emptyMessage="No featured products yet."
    >
      <ProductRow>
        {products.map((p: any) => (
          <ProductRowItem key={p.id}><ProductCard product={p} /></ProductRowItem>
        ))}
      </ProductRow>
    </ProductSectionShell>
  );
}
