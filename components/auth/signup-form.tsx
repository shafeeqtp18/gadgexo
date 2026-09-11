"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/lib/actions/auth";

export function SignupForm() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await signUpAction(formData);
      if (result?.error) setError(result.error);
      else if (result?.needsEmailConfirmation) setNeedsConfirmation(true);
      setLoading(false);
    } catch (err) {
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="rounded-lg border border-border p-4 text-small">
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-muted-foreground">We&apos;ve sent a confirmation link to your email address. Click it to activate your account.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name (optional)</Label>
        <Input id="name" name="name" type="text" autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>

      {error && <p role="alert" className="text-small text-error">{error}</p>}

      <Button type="submit" disabled={loading}>{loading ? "Creating account…" : "Create Account"}</Button>

      <p className="text-caption text-muted-foreground">
        Already have an account? <a href="/auth/login" className="text-primary hover:underline">Sign in</a>
      </p>
    </form>
  );
}
