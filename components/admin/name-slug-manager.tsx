"use client";

import * as React from "react";
import { UpsertNameSlugForm } from "./upsert-name-slug-form";

export interface NameSlugItem {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  productCount?: number;
}

export function NameSlugManager({
  items,
  action,
  itemLabel,
}: {
  items: NameSlugItem[];
  action: (formData: FormData) => Promise<{ error?: string }>;
  itemLabel: string;
}) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      {showCreate ? (
        <div className="rounded-lg border border-border p-3">
          <UpsertNameSlugForm action={action} onDone={() => setShowCreate(false)} />
        </div>
      ) : (
        <button type="button" onClick={() => setShowCreate(true)} className="w-fit rounded-md border border-border px-3 py-2 text-small">
          + Add {itemLabel}
        </button>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-small">
          <thead className="bg-surface-elevated text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Products</th>
              <th className="p-3">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td colSpan={5} className="p-3">
                    <UpsertNameSlugForm action={action} initial={item} onDone={() => setEditingId(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-muted-foreground">{item.slug}</td>
                  <td className="p-3 text-muted-foreground">{item.productCount ?? "—"}</td>
                  <td className="p-3">{item.is_active ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <button type="button" onClick={() => setEditingId(item.id)} className="text-primary hover:underline">Edit</button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      {items.length === 0 && <p className="text-small text-muted-foreground">None yet.</p>}
    </div>
  );
}
