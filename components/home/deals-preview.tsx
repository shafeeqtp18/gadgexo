import Link from "next/link";
import { getDeals } from "@/lib/db/deals";
import { Container, Section } from "@/components/layout/primitives";
import { DealCard } from "@/components/pricing/deal-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { Tag } from "lucide-react";

export async function DealsPreviewSection() {
  const { deals } = await getDeals("recent");
  const preview = deals.slice(0, 6);
  const hasUnverified = preview.some((d) => d.verificationStatus === "unverified");

  return (
    <Section className="py-8 sm:py-10">
      <Container>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-h2">Price &amp; Deals</h2>
          {preview.length > 0 && (
            <Link href="/deals" className="text-small font-medium text-primary">View all</Link>
          )}
        </div>
        {hasUnverified && (
          <p className="mb-5 text-caption text-muted-foreground">
            Some prices below are development/demo data and have not been verified against a live retailer — look for the &quot;Verified&quot; badge.
          </p>
        )}
        {preview.length === 0 ? (
          <EmptyState icon={Tag} title="No deals available yet" description="Check back once retailer pricing data is added." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((deal) => <DealCard key={deal.priceId} deal={deal} />)}
          </div>
        )}
      </Container>
    </Section>
  );
}
