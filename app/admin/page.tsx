import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/catalogue/spec-format";

async function getCount(table: string, filter?: (q: any) => any) {
  const supabase = createClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  await requireStaff();
  const supabase = createClient();

  const [products, brands, categories, prices, sources, pendingReviews, openConflicts, users] = await Promise.all([
    getCount("products"),
    getCount("brands"),
    getCount("categories"),
    getCount("prices"),
    getCount("sources"),
    getCount("review_queue", (q) => q.eq("status", "pending")),
    getCount("data_conflicts", (q) => q.eq("status", "open")),
    getCount("profiles"),
  ]);

  const { data: recentLogs, error: logsError } = await supabase
    .from("admin_logs")
    .select("id, action, entity_type, entity_id, created_at, user:profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(10);
  if (logsError) throw logsError;

  const cards = [
    { label: "Products", value: products },
    { label: "Brands", value: brands },
    { label: "Categories", value: categories },
    { label: "Price Records", value: prices },
    { label: "Sources", value: sources },
    { label: "Pending Reviews", value: pendingReviews },
    { label: "Open Conflicts", value: openConflicts },
    { label: "Users", value: users },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-h1">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-border p-4">
              <p className="text-caption text-muted-foreground">{card.label}</p>
              <p className="text-h2 font-semibold">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-h3">System Health</h2>
        <div className="flex gap-4 text-small">
          <span className="flex items-center gap-1.5 text-success">● Database connected</span>
          <span className="flex items-center gap-1.5 text-success">● Auth service reachable</span>
        </div>
        <p className="mt-1 text-caption text-muted-foreground">
          Checked implicitly by this page loading — no synthetic monitoring is implemented yet.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-h3">Recent Admin Activity</h2>
        {(recentLogs ?? []).length === 0 ? (
          <p className="text-small text-muted-foreground">No admin activity recorded yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {(recentLogs ?? []).map((log: any) => (
              <li key={log.id} className="flex items-center justify-between gap-4 p-3 text-small">
                <span>
                  <span className="font-medium">{log.user?.name ?? log.user?.email ?? "Unknown"}</span>{" "}
                  {log.action} <span className="text-muted-foreground">({log.entity_type})</span>
                </span>
                <span className="text-caption text-muted-foreground">{formatRelativeTime(log.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
