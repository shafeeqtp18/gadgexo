"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { resolveReviewAction } from "@/lib/actions/admin";

export function ReviewActions({ reviewId }: { reviewId: string }) {
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState<"approved" | "rejected" | null>(null);

  async function handle(status: "approved" | "rejected") {
    setPending(true);
    const result = await resolveReviewAction(reviewId, status);
    setPending(false);
    if (!result.error) setDone(status);
  }

  if (done) return <p className="text-caption text-muted-foreground">Marked {done}.</p>;

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => handle("approved")}>Approve</Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => handle("rejected")}>Reject</Button>
    </div>
  );
}
