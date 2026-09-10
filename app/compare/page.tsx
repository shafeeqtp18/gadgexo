import type { Metadata } from "next";
import { GitCompare } from "lucide-react";
import { Container, Section } from "@/components/layout/primitives";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <Section className="py-16">
      <Container>
        <EmptyState
          icon={GitCompare}
          title="Comparison tool coming soon"
          description="Side-by-side spec and price comparison is under active development."
        />
      </Container>
    </Section>
  );
}
