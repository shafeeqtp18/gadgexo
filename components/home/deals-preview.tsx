import { getFeaturedDeals } from "@/lib/db/prices";
import { Container, Section } from "@/components/layout/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/data-display/price-display";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Tag } from "lucide-react";

export async function DealsPreviewSection() {
  const deals = await getFeaturedDeals(6);
  const hasUnverifiedDeals = deals.some((d: any) => d.verification_status === "unverified");

  return (
    <Section className="py-8 sm:py-10">
      <Container>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-h2">Price &amp; Deals</h2>
        </div>
        {hasUnverifiedDeals && (
          <p className="mb-5 text-caption text-muted-foreground">
            Some prices below are development/demo data and have not been verified against a live retailer — look for the &quot;Verified&quot; badge.
          </p>
        )}
        {deals.length === 0 ? (
          <EmptyState icon={Tag} title="No deals available yet" description="Check back once retailer pricing data is added." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal: any, i: number) => (
              <Card key={i}>
                <CardContent className="flex flex-col gap-2 p-4">
                  <p className="text-small font-medium">
                    {deal.variant?.product?.brand?.name} {deal.variant?.product?.name}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {deal.variant?.ram} / {deal.variant?.storage} · {deal.retailer?.name}
                  </p>
                  <PriceDisplay price={deal.price} mrp={deal.mrp} size="sm" />
                  {deal.verification_status === "unverified" && (
                    <Badge variant="default" className="w-fit">Demo price</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
