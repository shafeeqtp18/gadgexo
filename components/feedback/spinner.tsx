import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <Loader2 className={cn("h-5 w-5 animate-spin text-muted-foreground", className)} aria-hidden="true" />
    </span>
  );
}
