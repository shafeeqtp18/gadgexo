"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/lib/actions/auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (next) formData.set("next", next);
    try {
      const result = await signInAction(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // On success the action redirects server-side; no further state change needed.
    } catch (err) {
      // redirect() throws internally on success (digest starts with
      // NEXT_REDIRECT) — let Next handle that; only surface real errors.
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>

      {error && <p role="alert" className="text-small text-error">{error}</p>}

      <Button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</Button>

      <div className="flex justify-between text-caption text-muted-foreground">
        <a href="/auth/forgot-password" className="hover:text-primary">Forgot password?</a>
        <a href="/auth/signup" className="hover:text-primary">Create account</a>
      </div>
    </form>
  );
}
