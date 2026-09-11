"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/lib/actions/profile";

export function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);
    if (result.error) setError(result.error);
    else setSaved(true);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email-display">Email</Label>
        <Input id="email-display" value={email} disabled readOnly />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Display Name</Label>
        <Input id="name" name="name" defaultValue={initialName} maxLength={100} />
      </div>
      {error && <p role="alert" className="text-small text-error">{error}</p>}
      {saved && <p className="text-small text-success">Saved.</p>}
      <Button type="submit" disabled={loading} className="w-fit">{loading ? "Saving…" : "Save Changes"}</Button>
    </form>
  );
}
