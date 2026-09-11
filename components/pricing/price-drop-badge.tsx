import { Flame } from "lucide-react";
import { formatINR } from "@/lib/catalogue/format";
import type { PriceDrop } from "@/lib/catalogue/price-drop";

export function PriceDropBadge({ drop, compact = false }: { drop: PriceDrop; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-caption font-medium text-error">
      <Flame className="h-3 w-3" aria-hidden="true" />
      {compact ? `${drop.percent}% off` : `↓ ${formatINR(drop.amount)} (${drop.percent}%)`}
    </span>
  );
}
