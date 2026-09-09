import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

export interface PriceDisplayProps {
  price: number;
  mrp?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = { sm: "text-body", md: "text-h3", lg: "text-h1" } as const;

/** Formatting only — callers pass real numbers from lib/db, never invented here. */
export function PriceDisplay({ price, mrp, currency = "INR", size = "md", className }: PriceDisplayProps) {
  const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 });
  const discountPercent = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-semibold", sizeClasses[size])}>{formatter.format(price)}</span>
      {mrp && mrp > price && (
        <span className="text-small text-muted-foreground line-through">{formatter.format(mrp)}</span>
      )}
      {discountPercent !== null && <Badge variant="success">{discountPercent}% off</Badge>}
    </div>
  );
}
