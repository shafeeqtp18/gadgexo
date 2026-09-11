import type { Metadata } from "next";
import { getDeals, type DealSort } from "@/lib/db/deals";
import { Container, Section } from "@/components/layout/primitives";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DealCard } from "@/components/pricing/deal-card";
import { DealsSortSelect } from "@/components/pricing/deals-sort-select";
import { EmptyState } from "@/components/feedback/empty-state";
import { Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Deals — Smartphone Price Drops & Current Prices | GadGexo",
  description: "Real price drops and current smartphone prices across retailers, tracked with verification status.",
  alternates: { canonical: "/deals" },
};

const VALID_SORTS: DealSort[] = ["recent", "biggest-drop", "price-low", "price-high"];

export default async function DealsPage({ searchParams }: { searchParams: { sort?: string } }) {
  const sort: DealSort = VALID_SORTS.includes(searchParams.sort as DealSort) ? (searchParams.sort as DealSort) : "recent";
  const { deals, priceDrops } = await getDeals(sort);

  return (
    <Section className="py-10">
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Deals" }]} className="mb-6" />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-h1">Deals</h1>
            <p className="text-small text-muted-foreground">Current smartphone prices, tracked across retailers.</p>
          </div>
          {deals.length > 0 && <DealsSortSelect sort={sort} />}
        </div>

        {deals.length === 0 ? (
          <EmptyState icon={Tag} title="No verified deals available right now" description="Check back once retailer pricing data is added." />
        ) : (
          <div className="flex flex-col gap-10">
            {priceDrops.length > 0 && (
              <div>
                <h2 className="mb-4 text-h3">🔥 Latest Price Drops</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {priceDrops.map((deal) => <DealCard key={deal.priceId} deal={deal} />)}
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-4 text-h3">Current Prices</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal) => <DealCard key={deal.priceId} deal={deal} />)}
              </div>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
