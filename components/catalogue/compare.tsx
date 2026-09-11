"use client";

import * as React from "react";
import { GitCompare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CompareItem {
  id: string;
  name: string;
  slug: string;
}

const MAX_COMPARE = 4;
const STORAGE_KEY = "gadgexo:compare-selection";

interface CompareContextValue {
  items: CompareItem[];
  isSelected: (id: string) => boolean;
  toggle: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  atMax: boolean;
}

const CompareContext = React.createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CompareItem[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // corrupted/blocked storage — start empty rather than throwing
    }
  }, []);

  const persist = (next: CompareItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — selection still works for this session
    }
  };

  const toggle = (item: CompareItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      const next = exists ? prev.filter((p) => p.id !== item.id) : prev.length < MAX_COMPARE ? [...prev, item] : prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const value: CompareContextValue = {
    items,
    isSelected: (id) => items.some((i) => i.id === id),
    toggle,
    remove: (id) => persist(items.filter((i) => i.id !== id)),
    clear: () => persist([]),
    atMax: items.length >= MAX_COMPARE,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

/** Exported (was internal-only in Phase 5) — the staging comparison page (Phase 7) reads/modifies the same local selection through this. */
export function useCompare() {
  const ctx = React.useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

export function CompareCheckbox({ product }: { product: CompareItem }) {
  const { isSelected, toggle, atMax } = useCompare();
  const selected = isSelected(product.id);
  const disabled = !selected && atMax;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
      title={disabled ? "You can compare up to 4 products at a time" : undefined}
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-caption transition-colors ${
        selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
      {selected ? "Added" : "Compare"}
    </button>
  );
}

export function CompareBar() {
  const { items, remove, clear } = useCompare();
  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-surface-elevated/95 backdrop-blur sm:bottom-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-small font-medium">Compare ({items.length}/4)</span>
        <div className="flex flex-1 flex-wrap gap-2">
          {items.map((item) => (
            <span key={item.id} className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-caption">
              {item.name}
              <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={clear}>Clear</Button>
        <Button asChild size="sm" disabled={items.length < 2}>
          <a href="/compare" aria-disabled={items.length < 2}>Compare Now</a>
        </Button>
      </div>
    </div>
  );
}
