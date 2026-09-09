import { Badge } from "@/components/ui/badge";
import type { VerificationStatus, VariantAvailability } from "@/types/database";

const verificationConfig: Record<VerificationStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
  unverified: { label: "Unverified", variant: "default" },
  partially_verified: { label: "Partially verified", variant: "info" },
  verified: { label: "Verified", variant: "success" },
  conflicting: { label: "Conflicting sources", variant: "warning" },
  needs_review: { label: "Needs review", variant: "warning" },
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = verificationConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const availabilityConfig: Record<VariantAvailability, { label: string; variant: "success" | "default" | "info" | "error" }> = {
  in_stock: { label: "In stock", variant: "success" },
  out_of_stock: { label: "Out of stock", variant: "default" },
  coming_soon: { label: "Coming soon", variant: "info" },
  discontinued: { label: "Discontinued", variant: "error" },
};

export function AvailabilityBadge({ status }: { status: VariantAvailability }) {
  const config = availabilityConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
