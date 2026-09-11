import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

const COPY: Record<string, { icon: typeof ShieldCheck; text: string; tone: string }> = {
  verified: { icon: ShieldCheck, text: "This information has been verified.", tone: "text-success" },
  partially_verified: { icon: ShieldQuestion, text: "Some information on this page has been verified; the rest has not.", tone: "text-warning" },
  needs_review: { icon: ShieldQuestion, text: "This listing is flagged for review — details may change.", tone: "text-warning" },
  conflicting: { icon: ShieldAlert, text: "Some information from available sources differs.", tone: "text-warning" },
  unverified: { icon: ShieldQuestion, text: "This listing has not been independently verified yet.", tone: "text-muted-foreground" },
};

export function VerificationNotice({ status }: { status: string }) {
  const copy = COPY[status] ?? COPY.unverified;
  const Icon = copy.icon;
  return (
    <div className={`flex items-center gap-2 text-small ${copy.tone}`}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{copy.text}</span>
    </div>
  );
}
