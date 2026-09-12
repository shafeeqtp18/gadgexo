import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/primitives";
import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata: Metadata = { title: "Unauthorized", robots: { index: false, follow: false } };

export default function AdminUnauthorizedPage() {
  return (
    <Section className="py-16">
      <Container>
        <EmptyState
          icon={ShieldAlert}
          title="You don't have access to this area"
          description="This section is restricted to GadGexo staff accounts."
        />
      </Container>
    </Section>
  );
}
