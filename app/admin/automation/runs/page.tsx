import Link from "next/link";
import { requireAdmin } from "@/lib/db/admin-auth";
import { getRecentAgentRuns } from "@/lib/db/agent";

export default async function AgentRunsPage() {
  await requireAdmin();
  const runs = await getRecentAgentRuns(50);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Agent Runs ({runs.length})</h1>
      {runs.length === 0 ? (
        <p className="text-small text-muted-foreground">No runs yet — trigger one from Automation.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-small">
          {runs.map((run) => (
            <li key={run.id} className="flex items-center justify-between p-3">
              <Link href={`/admin/automation/runs/${run.id}`} className="hover:text-primary">
                {run.agent_name} · {run.run_type}
              </Link>
              <span className="text-caption text-muted-foreground capitalize">
                {run.status} · {new Date(run.started_at).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
