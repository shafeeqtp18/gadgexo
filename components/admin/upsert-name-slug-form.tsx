"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function UpsertNameSlugForm({
  action,
  initial,
  onDone,
}: {
  action: (formData: FormData) => Promise<{ error?: string }>;
  initial?: { id: string; name: string; slug: string; is_active: boolean };
  onDone?: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await action(formData);
    setLoading(false);
    if (result.error) setError(result.error);
    else onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="flex flex-col gap-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initial?.name} required className="w-40" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={initial?.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" className="w-40" />
      </div>
      <label className="flex items-center gap-1.5 pb-2 text-small">
        <input type="checkbox" name="is_active" defaultChecked={initial?.is_active ?? true} /> Active
      </label>
      <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving…" : initial ? "Save" : "Create"}</Button>
      {error && <p className="w-full text-caption text-error">{error}</p>}
    </form>
  );
}
