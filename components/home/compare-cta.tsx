import { Container, Section } from "@/components/layout/primitives";
import { Button } from "@/components/ui/button";
import { GitCompare } from "lucide-react";

export function CompareCta() {
  return (
    <Section className="py-10 sm:py-12">
      <Container>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface-elevated p-10 text-center">
          <GitCompare className="h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="text-h2">Can&apos;t decide between two gadgets?</h2>
          <p className="max-w-md text-small text-muted-foreground">
            Compare specifications, prices, and features side by side.
          </p>
          <Button asChild size="lg">
            <a href="/compare">Start Comparing</a>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
