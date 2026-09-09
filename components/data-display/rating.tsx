import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Rating({ value, outOf = 5, className }: { value: number; outOf?: number; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} out of ${outOf} stars`}>
      {Array.from({ length: outOf }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < Math.round(value) ? "fill-warning text-warning" : "fill-none text-muted-foreground")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
