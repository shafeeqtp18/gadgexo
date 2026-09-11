import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/primitives";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CompareProvider } from "@/components/catalogue/compare";
import { StagingComparison } from "@/components/compare/staging-comparison";

export const metadata: Metadata = {
  title: "Compare Smartphones",
  description: "Select smartphones to compare specifications, prices and availability side by side.",
};

export default function ComparePage() {
  return (
    <CompareProvider>
      <Section className="py-10">
        <Container>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Compare" }]} className="mb-6" />
          <h1 className="mb-2 text-h1">Compare Smartphones</h1>
          <p className="mb-8 text-small text-muted-foreground">
            Select two to four smartphones to compare specifications, prices and availability side by side.
          </p>
          <StagingComparison />
        </Container>
      </Section>
    </CompareProvider>
  );
}
