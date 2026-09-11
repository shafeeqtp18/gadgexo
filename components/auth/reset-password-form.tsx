"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updatePasswordAction } from "@/lib/actions/auth";

export function ResetPasswordForm() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await updatePasswordAction(formData);
      if (result?.error) setError(result.error);
      setLoading(false);
    } catch (err) {
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {error && <p role="alert" className="text-small text-error">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Updating…" : "Update Password"}</Button>
    </form>
  );
}
