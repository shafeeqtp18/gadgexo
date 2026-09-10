"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Container, Section } from "@/components/layout/primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";

export function UpdatesCta() {
  const [email, setEmail] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No backend exists for this yet (Phase 9+). UI foundation only —
    // intentionally does not pretend to store anything.
    toast({
      title: "Not available yet",
      description: "Price alerts are coming in a future update.",
      variant: "info",
    });
    setEmail("");
  }

  return (
    <Section className="py-10 sm:py-12">
      <Container>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface-elevated p-10 text-center">
          <Bell className="h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="text-h2">Get notified about price drops</h2>
          <p className="max-w-md text-small text-muted-foreground">
            Price alerts are coming soon. Leave your email and we&apos;ll let you know when it&apos;s ready.
          </p>
          <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
            />
            <Button type="submit">Notify me</Button>
          </form>
        </div>
      </Container>
    </Section>
  );
}
