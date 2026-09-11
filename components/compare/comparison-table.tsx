"use client";

import * as React from "react";
import { ComparisonColumnHeader } from "./product-column-header";
import type { ComparisonGroup, QuickHighlight } from "@/lib/catalogue/compare-engine";
import type { ProductDetail } from "@/lib/db/product-detail";
import { cn } from "@/lib/utils/cn";

export function ComparisonTable({
  products,
  groups,
  quickHighlights,
  onRemove,
}: {
  products: ProductDetail[];
  groups: ComparisonGroup[];
  quickHighlights: QuickHighlight[];
  onRemove?: (productId: string) => void;
}) {
  const [highlightDiffs, setHighlightDiffs] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex w-fit items-center gap-2 text-small">
        <input
          type="checkbox"
          checked={highlightDiffs}
          onChange={(e) => setHighlightDiffs(e.target.checked)}
          className="h-4 w-4"
        />
        Highlight differences only
      </label>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 min-w-[140px] bg-background text-left align-bottom" />
              {products.map((product) => (
                <th key={product.id} scope="col" className="px-3 pb-3 align-bottom">
                  <ComparisonColumnHeader product={product} onRemove={onRemove ? () => onRemove(product.id) : undefined} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th
                scope="rowgroup"
                colSpan={products.length + 1}
                className="sticky left-0 bg-surface-elevated px-3 py-2 text-left text-small font-semibold"
              >
                Quick Highlights
              </th>
            </tr>
            {quickHighlights.map((row) => (
              <ComparisonRow key={row.label} label={row.label} values={row.values} highlightIndex={null} highlightDiffs={highlightDiffs} />
            ))}

            {groups.map((group) => (
              <React.Fragment key={group.groupId}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={products.length + 1}
                    className="sticky left-0 bg-surface-elevated px-3 py-2 text-left text-small font-semibold"
                  >
                    {group.groupName}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <ComparisonRow
                    key={row.specId}
                    label={row.specName}
                    values={row.values}
                    highlightIndex={row.highlightIndex}
                    highlightDiffs={highlightDiffs}
                  />
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  values,
  highlightIndex,
  highlightDiffs,
}: {
  label: string;
  values: (string | null)[];
  highlightIndex: number | null;
  highlightDiffs: boolean;
}) {
  const presentValues = values.filter((v) => v !== null);
  const allIdentical = presentValues.length === values.length && new Set(presentValues).size === 1;
  if (highlightDiffs && allIdentical) return null;

  return (
    <tr className="border-t border-border">
      <th scope="row" className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-small font-normal text-muted-foreground">
        {label}
      </th>
      {values.map((value, i) => (
        <td
          key={i}
          className={cn("px-3 py-2 text-center text-small", i === highlightIndex && "font-semibold text-success")}
        >
          {value ?? <span className="text-muted-foreground">—</span>}
          {i === highlightIndex && <span aria-hidden="true"> ★</span>}
          {i === highlightIndex && <span className="sr-only"> (higher — objectively better)</span>}
        </td>
      ))}
    </tr>
  );
}
