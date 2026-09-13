import Link from "next/link";
import { requireAdmin } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { AutomationForm } from "@/components/admin/automation-form";
import { RunDiscoveryButton } from "@/components/admin/run-discovery-button";
import { REGISTERED_PROVIDERS } from "@/lib/agent/providers";
import { getRecentAgentRuns } from "@/lib/db/agent";

export default async function AdminAutomationPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: settings, error } = await supabase
    .from("automation_settings")
    .select("enabled, automation_mode, confidence_threshold, updated_at")
    .is("category_id", null)
    .maybeSingle();
  if (error) throw error;

  const recentRuns = await getRecentAgentRuns(3);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-2 text-h1">Automation</h1>
        <p className="max-w-xl text-small text-muted-foreground">
          This is the global control switch for GadGexo&apos;s autonomous data agent. It ships disabled, and nothing writes to the catalog
        </p>
      </div>

      <AutomationForm
        initial={settings ?? { enabled: false, automation_mode: "approval", confidence_threshold: 0.9, updated_at: null }}
      />

      <div>
        <h2 className="mb-2 text-h3">Source Configuration</h2>
        {REGISTERED_PROVIDERS.length === 0 ? (
          <p className="max-w-xl text-small text-muted-foreground">
            <strong className="text-foreground">No source provider is connected.</strong> The agent pipeline (dedup, confidence,
            conflict detection, review routing) is fully built and working, but discovery has nothing to fetch until a real
            manufacturer/retailer data source is implemented and registered in <code>lib/agent/providers/index.ts</code>. Running
            discovery now is safe — it will honestly report 0 candidates found, not fabricate any.
          </p>
        ) : (
          <ul className="text-small">
            {REGISTERED_PROVIDERS.map((p) => <li key={p.id}>{p.name}</li>)}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-h3">Manual Run</h2>
        <RunDiscoveryButton />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-h3">Recent Runs</h2>
          <Link href="/admin/automation/runs" className="text-small text-primary">View all</Link>
        </div>
        {recentRuns.length === 0 ? (
          <p className="text-small text-muted-foreground">No runs yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-small">
            {recentRuns.map((run) => (
              <li key={run.id} className="flex items-center justify-between p-3">
                <Link href={`/admin/automation/runs/${run.id}`} className="hover:text-primary">
                  {run.agent_name} · {run.run_type}
                </Link>
                <span className="text-caption text-muted-foreground capitalize">{run.status} · {new Date(run.started_at).toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
