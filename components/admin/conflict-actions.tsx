"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { resolveConflictAction } from "@/lib/actions/admin";

export function ConflictActions({ conflictId }: { conflictId: string }) {
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState<"resolved" | "ignored" | null>(null);

  async function handle(status: "resolved" | "ignored") {
    setPending(true);
    const result = await resolveConflictAction(conflictId, status);
    setPending(false);
    if (!result.error) setDone(status);
  }

  if (done) return <p className="text-caption text-muted-foreground">Marked {done}.</p>;

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => handle("resolved")}>Mark Resolved</Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => handle("ignored")}>Ignore</Button>
    </div>
  );
}
