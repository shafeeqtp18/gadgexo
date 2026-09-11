import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComparisonByToken } from "@/lib/db/compare";
import { buildSpecificationComparison, buildQuickHighlights } from "@/lib/catalogue/compare-engine";
import { Container, Section } from "@/components/layout/primitives";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TokenComparisonClient } from "@/components/compare/token-comparison-client";
import { OneProductState } from "@/components/compare/one-product-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { GitCompare } from "lucide-react";

interface Props {
  params: { token: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const comparison = await getComparisonByToken(params.token);
  if (!comparison || comparison.products.length === 0) return { title: "Comparison" };

  const names = comparison.products.map((p) => p.name);
  return {
    title: `${names.join(" vs ")} — Comparison | GadGexo`,
    description: `Compare specifications, prices and availability: ${names.join(", ")}.`,
    // Shareable comparisons are user-generated and combinatorial —
    // never indexed, per the Phase 7 brief.
    robots: { index: false, follow: true },
  };
}

export default async function SavedComparisonPage({ params }: Props) {
  const comparison = await getComparisonByToken(params.token);
  if (!comparison) notFound();

  const { products, token } = comparison;

  return (
    <Section className="py-10">
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Compare", href: "/compare" }, { label: "Saved comparison" }]} className="mb-6" />
        <h1 className="mb-6 text-h1">Comparison</h1>

        {products.length === 0 ? (
          <EmptyState
            icon={GitCompare}
            title="This comparison is empty"
            description="Every product in this comparison has been removed or is no longer published."
          />
        ) : products.length === 1 ? (
          <OneProductState token={token} product={products[0]} />
        ) : (
          <TokenComparisonClient
            token={token}
            products={products}
            groups={buildSpecificationComparison(products)}
            quickHighlights={buildQuickHighlights(products)}
          />
        )}
      </Container>
    </Section>
  );
}
