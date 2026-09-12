import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

export default async function AdminLogsPage({ searchParams }: { searchParams: { page?: string } }) {
  await requireStaff();
  const supabase = createClient();

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const { data: logs, error } = await supabase
    .from("admin_logs")
    .select("id, action, entity_type, entity_id, created_at, user:profiles(name, email)")
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Admin Activity Log</h1>
      {(logs ?? []).length === 0 ? (
        <p className="text-small text-muted-foreground">No admin actions recorded yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-small">
          {(logs ?? []).map((log: any) => (
            <li key={log.id} className="flex items-center justify-between gap-4 p-3">
              <span>
                <span className="font-medium">{log.user?.name ?? log.user?.email ?? "Unknown"}</span> {log.action}{" "}
                <span className="text-muted-foreground">({log.entity_type}{log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""})</span>
              </span>
              <span className="text-caption text-muted-foreground">{new Date(log.created_at).toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
