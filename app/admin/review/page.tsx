import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { ReviewActions } from "@/components/admin/review-actions";

export default async function AdminReviewPage() {
  await requireStaff();
  const supabase = createClient();

  const { data: items, error } = await supabase
    .from("review_queue")
    .select(`
      id, entity_type, entity_id, reason, priority, status, created_at,
      agent_action:agent_actions(action_type, proposed_data, confidence_score)
    `)
    .eq("status", "pending")
    .order("priority", { ascending: false });
  if (error) throw error;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Review Queue ({(items ?? []).length} pending)</h1>

      {(items ?? []).length === 0 ? (
        <p className="text-small text-muted-foreground">
          Nothing needs review right now. This queue will populate once Phase 11's data agent is connected.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {(items ?? []).map((item: any) => (
            <li key={item.id} className="rounded-lg border border-border p-4">
              <p className="text-small font-medium">{item.entity_type} · {item.reason}</p>
              {item.agent_action && (
                <p className="mt-1 text-caption text-muted-foreground">
                  Proposed: {JSON.stringify(item.agent_action.proposed_data)}
                  {item.agent_action.confidence_score !== null && ` · confidence ${item.agent_action.confidence_score}`}
                </p>
              )}
              <p className="mt-1 text-caption text-muted-foreground">Priority {item.priority} · {new Date(item.created_at).toLocaleDateString("en-IN")}</p>
              <div className="mt-3">
                <ReviewActions reviewId={item.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
