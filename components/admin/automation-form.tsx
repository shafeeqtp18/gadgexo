"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/overlays/dialog";
import { updateAutomationSettingsAction } from "@/lib/actions/admin";

interface Settings {
  enabled: boolean;
  automation_mode: string;
  confidence_threshold: number;
  updated_at: string | null;
}

export function AutomationForm({ initial }: { initial: Settings }) {
  const [enabled, setEnabled] = React.useState(initial.enabled);
  const [mode, setMode] = React.useState(initial.automation_mode);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingEnable, setPendingEnable] = React.useState<boolean | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function requestToggle(next: boolean) {
    if (next) {
      setPendingEnable(true);
      setConfirmOpen(true);
    } else {
      setEnabled(false); // disabling is always safe, no confirmation needed
    }
  }

  async function submit(finalEnabled: boolean, finalMode: string) {
    setSaving(true);
    setError(null);
    const formData = new FormData();
    if (finalEnabled) formData.set("enabled", "on");
    formData.set("automation_mode", finalMode);
    const result = await updateAutomationSettingsAction(formData);
    setSaving(false);
    if (result.error) setError(result.error);
    else {
      setEnabled(finalEnabled);
      setMode(finalMode);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-small font-medium">Automation Status</span>
        <button
          type="button"
          onClick={() => requestToggle(!enabled)}
          className={`rounded-full px-3 py-1 text-caption font-medium ${enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
        >
          {enabled ? "ON" : "OFF"}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mode" className="text-small font-medium">Mode</label>
        <select
          id="mode"
          value={mode}
          onChange={(e) => submit(enabled, e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-small"
        >
          <option value="approval">Approval (every change reviewed)</option>
          <option value="smart_auto">Smart Auto (high-confidence only)</option>
          <option value="full_auto">Full Automation</option>
        </select>
      </div>

      {error && <p className="text-caption text-error">{error}</p>}
      {saving && <p className="text-caption text-muted-foreground">Saving…</p>}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable automation?</DialogTitle>
          </DialogHeader>
          <p className="text-small text-muted-foreground">
            This turns on the control switch Phase 11's data agent will use. No agent exists yet, so this alone changes nothing live —
            but confirm you intend to flip this switch.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                if (pendingEnable) submit(true, mode);
              }}
            >
              Yes, enable
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
