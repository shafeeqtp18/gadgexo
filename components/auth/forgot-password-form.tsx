"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestPasswordResetAction } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordResetAction(formData);
    if (result?.error) setError(result.error);
    else setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border p-4 text-small">
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-muted-foreground">If an account exists for that email, we&apos;ve sent a password reset link.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {error && <p role="alert" className="text-small text-error">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</Button>
      <p className="text-caption text-muted-foreground">
        <a href="/auth/login" className="text-primary hover:underline">Back to sign in</a>
      </p>
    </form>
  );
}
