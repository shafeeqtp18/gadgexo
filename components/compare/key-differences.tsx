import type { ComparisonGroup } from "@/lib/catalogue/compare-engine";

export function KeyDifferences({ groups, productNames }: { groups: ComparisonGroup[]; productNames: string[] }) {
  const diffRows = groups
    .flatMap((g) => g.rows)
    .filter((row) => {
      const present = row.values.filter((v) => v !== null);
      return present.length >= 2 && new Set(present).size > 1;
    })
    .slice(0, 6);

  if (diffRows.length === 0) return null;

  return (
    <div className="rounded-lg border border-border p-4">
      <h2 className="mb-3 text-h3">Key Differences</h2>
      <ul className="flex flex-col gap-2 text-small">
        {diffRows.map((row) => (
          <li key={row.specId}>
            <span className="font-medium">{row.specName}:</span>{" "}
            {row.values.map((v, i) => `${productNames[i]} ${v ?? "—"}`).join(" vs. ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
