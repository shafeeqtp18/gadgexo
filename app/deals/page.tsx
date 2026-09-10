import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { Container, Section } from "@/components/layout/primitives";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata: Metadata = { title: "Deals" };

export default function DealsPage() {
  return (
    <Section className="py-16">
      <Container>
        <EmptyState
          icon={Tag}
          title="Full deals page coming soon"
          description="A dedicated deals and price-tracking page is under active development. See a preview on the homepage."
        />
      </Container>
    </Section>
  );
}
