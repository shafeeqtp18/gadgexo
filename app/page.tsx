import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { CategoryExplorer } from "@/components/home/category-explorer";
import { TrendingSection, LatestReleasesSection, FeaturedSection } from "@/components/home/catalog-sections";
import { DealsPreviewSection } from "@/components/home/deals-preview";
import { CompareCta } from "@/components/home/compare-cta";
import { RecentlyUpdatedSection } from "@/components/home/recently-updated";
import { WhyGadgexo } from "@/components/home/why-gadgexo";
import { UpdatesCta } from "@/components/home/updates-cta";
import { Container } from "@/components/layout/primitives";
import { ProductCardSkeleton } from "@/components/data-display/product-card-skeleton";

export const metadata: Metadata = {
  title: "GadGexo — Discover, compare and track gadgets",
  description: "Compare specs, prices, and gadgets from trusted sources. Starting with smartphones in India.",
};

function CardGridSkeleton() {
  return (
    <Container>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </Container>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryExplorer />

      <Suspense fallback={<CardGridSkeleton />}>
        <TrendingSection />
      </Suspense>

      <Suspense fallback={<CardGridSkeleton />}>
        <LatestReleasesSection />
      </Suspense>

      <Suspense fallback={<CardGridSkeleton />}>
        <FeaturedSection />
      </Suspense>

      <Suspense fallback={<Container><p className="text-muted-foreground">Loading deals…</p></Container>}>
        <DealsPreviewSection />
      </Suspense>

      <CompareCta />

      <Suspense fallback={<Container><p className="text-muted-foreground">Loading…</p></Container>}>
        <RecentlyUpdatedSection />
      </Suspense>

      <WhyGadgexo />
      <UpdatesCta />
    </>
  );
}
