import { requireAdmin } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { UserRoleSelect } from "@/components/admin/user-role-select";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const supabase = createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Users ({(users ?? []).length})</h1>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-small">
          <thead className="bg-surface-elevated text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(users ?? []).map((u) => (
              <tr key={u.id}>
                <td className="p-3">{u.name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                <td className="p-3">
                  {u.id === admin.id ? (
                    <span className="text-muted-foreground">{u.role} (you)</span>
                  ) : (
                    <UserRoleSelect userId={u.id} currentRole={u.role} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
