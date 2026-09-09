import { cn } from "@/lib/utils/cn";

export function KeyValueRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-0", className)}>
      <dt className="text-small text-muted-foreground">{label}</dt>
      <dd className="text-small font-medium text-right">{value}</dd>
    </div>
  );
}

export function SpecGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-1 text-label uppercase tracking-wide text-muted-foreground">{title}</h4>
      <dl>{children}</dl>
    </section>
  );
}
