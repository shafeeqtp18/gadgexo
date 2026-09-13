"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { triggerDiscoveryRunAction } from "@/lib/actions/agent";

export function RunDiscoveryButton() {
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<{ error?: string; runId?: string; noProviderWarning?: boolean } | null>(null);

  async function handleClick() {
    setPending(true);
    setResult(null);
    const res = await triggerDiscoveryRunAction("smartphones");
    setResult(res);
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={pending} className="w-fit">
        {pending ? "Running…" : "Run Discovery Now"}
      </Button>
      {result?.error && <p className="text-small text-error">{result.error}</p>}
      {result?.runId && !result.error && (
        <div className="text-small">
          <p className="text-success">
            Run completed — <a href={`/admin/automation/runs/${result.runId}`} className="underline">view details</a>
          </p>
          {result.noProviderWarning && (
            <p className="mt-1 text-caption text-muted-foreground">
              No source provider is registered yet, so this run discovered 0 candidates — see &quot;Source Configuration&quot; below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
