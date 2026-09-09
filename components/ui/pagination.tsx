import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}

export function Pagination({ currentPage, totalPages, buildHref, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border",
          currentPage === 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="px-3 text-small text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border",
          currentPage === totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
