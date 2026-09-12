import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { ConflictActions } from "@/components/admin/conflict-actions";

export default async function AdminConflictsPage() {
  await requireStaff();
  const supabase = createClient();

  const { data: conflicts, error } = await supabase
    .from("data_conflicts")
    .select("id, entity_type, entity_id, field_name, conflicting_values, status, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Data Conflicts ({(conflicts ?? []).length} open)</h1>

      {(conflicts ?? []).length === 0 ? (
        <p className="text-small text-muted-foreground">No open conflicts. This list will populate once multiple sources disagree on a value.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {(conflicts ?? []).map((c) => (
            <li key={c.id} className="rounded-lg border border-border p-4">
              <p className="text-small font-medium">{c.entity_type} · {c.field_name}</p>
              <ul className="mt-2 flex flex-col gap-1 text-caption text-muted-foreground">
                {(c.conflicting_values as any[]).map((v, i) => (
                  <li key={i}>Source {v.source_id}: <span className="font-medium text-foreground">{v.value}</span></li>
                ))}
              </ul>
              <p className="mt-2 text-caption text-muted-foreground">{new Date(c.created_at).toLocaleDateString("en-IN")}</p>
              <div className="mt-3">
                <ConflictActions conflictId={c.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
