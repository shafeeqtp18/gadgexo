import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/db/admin-auth";
import { getAgentRunDetail } from "@/lib/db/agent";

export default async function AgentRunDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const detail = await getAgentRunDetail(params.id);
  if (!detail) notFound();

  const { run, actions } = detail;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1">{run.agent_name}</h1>
        <p className="text-small text-muted-foreground">
          {run.run_type} · <span className="capitalize">{run.status}</span> · started {new Date(run.started_at).toLocaleString("en-IN")}
          {run.completed_at && ` · finished ${new Date(run.completed_at).toLocaleString("en-IN")}`}
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-h3">Summary</h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-surface-elevated p-3 text-caption">
          {JSON.stringify(run.summary, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="mb-2 text-h3">Actions ({actions.length})</h2>
        {actions.length === 0 ? (
          <p className="text-small text-muted-foreground">No actions were taken during this run.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-small">
            {actions.map((a: any) => (
              <li key={a.id} className="flex items-center justify-between p-3">
                <span>{a.action_type} <span className="text-muted-foreground">({a.entity_type})</span></span>
                <span className="text-caption text-muted-foreground capitalize">
                  {a.status}{a.confidence_score !== null ? ` · confidence ${a.confidence_score}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
