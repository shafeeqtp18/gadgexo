import { formatSpecValue } from "@/lib/catalogue/spec-format";
import type { ProductDetail } from "@/lib/db/product-detail";

// Only these — exactly the examples the brief itself calls objectively
// valid ("higher battery capacity", "higher refresh rate", "larger
// storage"). Never megapixels, chipset, display size, or price — the
// brief explicitly forbids inferring a winner from those.
const HIGHER_IS_BETTER_SPEC_SLUGS = new Set(["battery-capacity", "refresh-rate"]);

export interface ComparisonRow {
  specId: string;
  specName: string;
  values: (string | null)[]; // one per product, aligned by index — null = "—"
  highlightIndex: number | null; // index of the objectively-better value, if any
}

export interface ComparisonGroup {
  groupId: string;
  groupName: string;
  rows: ComparisonRow[];
}

export interface QuickHighlight {
  label: string;
  values: (string | null)[];
}

function baseVariant(product: ProductDetail) {
  const inStock = product.variants.filter((v) => v.availability === "in_stock");
  return inStock[0] ?? product.variants[0];
}

function minPrice(product: ProductDetail): number | null {
  const variant = baseVariant(product);
  const prices = variant?.prices.filter((p) => p.availability === "in_stock") ?? [];
  return prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : null;
}

export function buildSpecificationComparison(products: ProductDetail[]): ComparisonGroup[] {
  // Semantic alignment: index every product's specs by specification.id,
  // never by array position or raw label text.
  const groupOrder = new Map<string, { name: string; sortOrder: number }>();
  const rowsBySpecId = new Map<string, { name: string; unit: string | null; groupId: string; numericValues: (number | null)[]; rawValues: (string | null)[] }>();

  products.forEach((product, productIndex) => {
    for (const group of product.specGroups) {
      if (!groupOrder.has(group.id)) groupOrder.set(group.id, { name: group.name, sortOrder: group.sort_order });
      for (const spec of group.specs) {
        if (!rowsBySpecId.has(spec.id)) {
          rowsBySpecId.set(spec.id, {
            name: spec.name,
            unit: spec.unit,
            groupId: group.id,
            numericValues: new Array(products.length).fill(null),
            rawValues: new Array(products.length).fill(null),
          });
        }
        const row = rowsBySpecId.get(spec.id)!;
        row.rawValues[productIndex] = spec.value;
        const numeric = parseFloat(spec.value);
        row.numericValues[productIndex] = Number.isFinite(numeric) ? numeric : null;
      }
    }
  });

  const groups: ComparisonGroup[] = [...groupOrder.entries()]
    .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
    .map(([groupId, meta]) => ({ groupId, groupName: meta.name, rows: [] as ComparisonRow[] }));
  const groupById = new Map(groups.map((g) => [g.groupId, g]));

  for (const [specId, row] of rowsBySpecId) {
    // Find the underlying spec's slug for the advantage-highlight allowlist.
    const slug = products.flatMap((p) => p.specGroups).flatMap((g) => g.specs).find((s) => s.id === specId)?.slug;

    let highlightIndex: number | null = null;
    if (slug && HIGHER_IS_BETTER_SPEC_SLUGS.has(slug)) {
      const withValues = row.numericValues.map((v, i) => ({ v, i })).filter((x) => x.v !== null);
      if (withValues.length >= 2) {
        const best = withValues.reduce((a, b) => (b.v! > a.v! ? b : a));
        const allSame = withValues.every((x) => x.v === best.v);
        if (!allSame) highlightIndex = best.i;
      }
    }

    groupById.get(row.groupId)!.rows.push({
      specId,
      specName: row.name,
      values: row.rawValues.map((v) => (v === null ? null : formatSpecValue(v, row.unit))),
      highlightIndex,
    });
  }

  return groups.filter((g) => g.rows.length > 0);
}

export function buildQuickHighlights(products: ProductDetail[]): QuickHighlight[] {
  const highlights: QuickHighlight[] = [];

  const specSlugLabels: [string, string][] = [
    ["display-size", "Display"],
    ["chipset", "Processor"],
    ["main-camera", "Main Camera"],
    ["battery-capacity", "Battery"],
  ];

  for (const [slug, label] of specSlugLabels) {
    const values = products.map((p) => {
      const spec = p.specGroups.flatMap((g) => g.specs).find((s) => s.slug === slug);
      return spec ? formatSpecValue(spec.value, spec.unit) : null;
    });
    if (values.some((v) => v !== null)) highlights.push({ label, values });
  }

  const ram = products.map((p) => baseVariant(p)?.ram ?? null);
  if (ram.some((v) => v)) highlights.push({ label: "RAM", values: ram });

  const storage = products.map((p) => baseVariant(p)?.storage ?? null);
  if (storage.some((v) => v)) highlights.push({ label: "Storage", values: storage });

  const prices = products.map((p) => {
    const price = minPrice(p);
    return price !== null ? `₹${price.toLocaleString("en-IN")}` : null;
  });
  highlights.push({ label: "Price", values: prices });

  return highlights;
}
