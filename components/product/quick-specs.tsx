import { formatSpecValue } from "@/lib/catalogue/spec-format";
import type { DetailSpecGroup, DetailVariant } from "@/lib/db/product-detail";

const QUICK_SPEC_SLUGS = ["display-size", "chipset", "main-camera", "battery-capacity", "operating-system", "5g"];

export function QuickSpecs({ specGroups, baseVariant }: { specGroups: DetailSpecGroup[]; baseVariant?: DetailVariant }) {
  const bySlug = new Map<string, { name: string; unit: string | null; value: string }>();
  for (const group of specGroups) {
    for (const spec of group.specs) {
      if (QUICK_SPEC_SLUGS.includes(spec.slug)) bySlug.set(spec.slug, spec);
    }
  }

  const rows: { label: string; value: string }[] = [];
  if (baseVariant?.ram) rows.push({ label: "RAM", value: baseVariant.ram });
  if (baseVariant?.storage) rows.push({ label: "Storage", value: baseVariant.storage });
  for (const slug of QUICK_SPEC_SLUGS) {
    const spec = bySlug.get(slug);
    if (spec) rows.push({ label: spec.name, value: formatSpecValue(spec.value, spec.unit) });
  }

  if (rows.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-h3">Key Specifications</h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-caption text-muted-foreground">{row.label}</dt>
            <dd className="text-small font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
