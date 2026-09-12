import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSourcesPage() {
  await requireStaff();
  const supabase = createClient();

  const { data: sources, error } = await supabase
    .from("sources")
    .select("id, name, domain, source_type, reliability_priority, is_active, updated_at")
    .order("reliability_priority", { ascending: false });
  if (error) throw error;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Sources ({(sources ?? []).length})</h1>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-small">
          <thead className="bg-surface-elevated text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Domain</th>
              <th className="p-3">Reliability</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(sources ?? []).map((s) => (
              <tr key={s.id}>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 text-muted-foreground capitalize">{s.source_type.replace("_", " ")}</td>
                <td className="p-3 text-muted-foreground">{s.domain ?? "—"}</td>
                <td className="p-3">{s.reliability_priority}</td>
                <td className="p-3">{s.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(sources ?? []).length === 0 && <p className="text-small text-muted-foreground">No sources recorded yet.</p>}
      <p className="text-caption text-muted-foreground">Read-only for now — source management (add/edit) will come with Phase 11.</p>
    </div>
  );
}
