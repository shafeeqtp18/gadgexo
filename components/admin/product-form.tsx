"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProductAction } from "@/lib/actions/admin";

const STATUSES = ["draft", "review", "published", "archived", "rejected"];

export function AdminProductForm({ productId, initial }: { productId: string; initial: { name: string; short_description: string; status: string } }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    const result = await updateProductAction(productId, formData);
    if (result.error) setError(result.error);
    else setSaved(true);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initial.name} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="short_description">Short Description</Label>
        <Textarea id="short_description" name="short_description" defaultValue={initial.short_description} rows={3} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" defaultValue={initial.status} className="rounded-md border border-border bg-background px-3 py-2 text-small">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="text-small text-error">{error}</p>}
      {saved && <p className="text-small text-success">Saved.</p>}
      <Button type="submit" disabled={loading} className="w-fit">{loading ? "Saving…" : "Save Changes"}</Button>
    </form>
  );
}
