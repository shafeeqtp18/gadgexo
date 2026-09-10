import Link from "next/link";
import { getRecentlyUpdatedProducts } from "@/lib/db/products";
import { Container, Section } from "@/components/layout/primitives";
import { VerificationBadge } from "@/components/data-display/status-indicator";
import { EmptyState } from "@/components/feedback/empty-state";
import { History } from "lucide-react";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export async function RecentlyUpdatedSection() {
  const products = await getRecentlyUpdatedProducts(6);

  return (
    <Section className="py-8 sm:py-10">
      <Container>
        <h2 className="mb-2 text-h2">Recently Updated</h2>
        <p className="mb-5 text-caption text-muted-foreground">
          GadGexo&apos;s catalog is actively maintained — here&apos;s what changed most recently.
        </p>
        {products.length === 0 ? (
          <EmptyState icon={History} title="No update history yet" />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {products.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between gap-4 p-4">
                <Link href={`/smartphones/${p.slug}`} className="text-small font-medium hover:text-primary">
                  {p.brand?.name} {p.name}
                </Link>
                <div className="flex items-center gap-3">
                  <VerificationBadge status={p.verification_status} />
                  <span className="text-caption text-muted-foreground">{relativeTime(p.updated_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
