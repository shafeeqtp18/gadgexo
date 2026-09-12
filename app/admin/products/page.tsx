import Link from "next/link";
import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { VerificationBadge } from "@/components/data-display/status-indicator";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({ searchParams }: { searchParams: { q?: string; status?: string; page?: string } }) {
  await requireStaff();
  const supabase = createClient();

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("products")
    .select("id, name, slug, status, verification_status, updated_at, brand:brands(name)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (searchParams.q) query = query.ilike("name", `%${searchParams.q}%`);
  if (searchParams.status) query = query.eq("status", searchParams.status);

  const { data: products, count, error } = await query;
  if (error) throw error;

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Products ({count ?? 0})</h1>

      <form className="flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={searchParams.q} placeholder="Search by name…" className="rounded-md border border-border bg-background px-3 py-2 text-small" />
        <select name="status" defaultValue={searchParams.status ?? ""} className="rounded-md border border-border bg-background px-3 py-2 text-small">
          <option value="">All statuses</option>
          {["draft", "review", "published", "archived", "rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="rounded-md border border-border px-3 py-2 text-small">Filter</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-small">
          <thead className="bg-surface-elevated text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Status</th>
              <th className="p-3">Verification</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(products ?? []).map((p: any) => (
              <tr key={p.id}>
                <td className="p-3"><Link href={`/admin/products/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link></td>
                <td className="p-3 text-muted-foreground">{p.brand?.name}</td>
                <td className="p-3 capitalize">{p.status}</td>
                <td className="p-3"><VerificationBadge status={p.verification_status} /></td>
                <td className="p-3 text-muted-foreground">{new Date(p.updated_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(products ?? []).length === 0 && <p className="text-small text-muted-foreground">No products match this filter.</p>}

      {totalPages > 1 && (
        <div className="flex gap-2 text-small">
          {page > 1 && <Link href={buildPageHref(searchParams, page - 1)} className="underline">Previous</Link>}
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={buildPageHref(searchParams, page + 1)} className="underline">Next</Link>}
        </div>
      )}
    </div>
  );
}

function buildPageHref(searchParams: { q?: string; status?: string }, page: number): string {
  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.status) params.set("status", searchParams.status);
  params.set("page", String(page));
  return `?${params.toString()}`;
}
