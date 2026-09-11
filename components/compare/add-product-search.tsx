"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { searchProductsForCompare } from "@/lib/actions/compare";

interface SearchResult { id: string; name: string; brandName: string | null }

export function AddProductSearch({
  excludeIds,
  onAdd,
  disabled,
  disabledReason,
}: {
  excludeIds: string[];
  onAdd: (productId: string) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  function handleChange(value: string) {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!value.trim()) { setResults([]); return; }
    timeoutRef.current = setTimeout(async () => {
      const res = await searchProductsForCompare(value, excludeIds);
      setResults(res);
    }, 300);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={disabled ? disabledReason : "Add a gadget to compare..."}
          aria-label="Search smartphones to add to comparison"
          className="w-full bg-transparent text-small outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface-elevated shadow-lg">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-small hover:bg-primary/10"
                onClick={() => {
                  onAdd(r.id);
                  setQuery("");
                  setResults([]);
                }}
              >
                {r.brandName && <span className="text-muted-foreground">{r.brandName} </span>}
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
