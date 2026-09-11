import { formatRelativeTime } from "@/lib/catalogue/spec-format";

export function PriceFreshness({ observedAt, verificationStatus }: { observedAt: string; verificationStatus: string }) {
  return (
    <span className="text-caption text-muted-foreground">
      Last checked {formatRelativeTime(observedAt)}
      {verificationStatus === "unverified" && " · demo price, not verified"}
      {verificationStatus === "conflicting" && " · prices differ across sources"}
    </span>
  );
}
