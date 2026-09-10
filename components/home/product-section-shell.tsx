import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container, Section } from "@/components/layout/primitives";
import { EmptyState } from "@/components/feedback/empty-state";
import { PackageSearch } from "lucide-react";

export function ProductSectionShell({
  title,
  viewAllHref,
  isEmpty,
  emptyMessage,
  children,
}: {
  title: string;
  viewAllHref?: string;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <Section className="py-8 sm:py-10">
      <Container>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-h2">{title}</h2>
          {viewAllHref && !isEmpty && (
            <Link href={viewAllHref} className="flex items-center gap-1 text-small font-medium text-primary">
              View all <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
        {isEmpty ? (
          <EmptyState icon={PackageSearch} title="Nothing here yet" description={emptyMessage} />
        ) : (
          children
        )}
      </Container>
    </Section>
  );
}
