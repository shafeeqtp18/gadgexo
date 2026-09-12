import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/catalogue/spec-format";

const PAGE_SIZE = 25;

export default async function AdminPricesPage({ searchParams }: { searchParams: { availability?: string; page?: string } }) {
  await requireStaff();
  const supabase = createClient();

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("prices")
    .select(`
      id, price, availability, verification_status, last_checked_at,
      retailer:retailers(name),
      variant:product_variants(ram, storage, product:products(name))
    `, { count: "exact" })
    .order("last_checked_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (searchParams.availability) query = query.eq("availability", searchParams.availability);

  const { data: prices, count, error } = await query;
  if (error) throw error;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Prices ({count ?? 0})</h1>

      <form className="flex gap-2" method="get">
        <select name="availability" defaultValue={searchParams.availability ?? ""} className="rounded-md border border-border bg-background px-3 py-2 text-small">
          <option value="">All availability</option>
          {["in_stock", "out_of_stock", "pre_order", "unavailable", "unknown"].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <button type="submit" className="rounded-md border border-border px-3 py-2 text-small">Filter</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-small">
          <thead className="bg-surface-elevated text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Retailer</th>
              <th className="p-3">Price</th>
              <th className="p-3">Availability</th>
              <th className="p-3">Verification</th>
              <th className="p-3">Last Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(prices ?? []).map((p: any) => (
              <tr key={p.id}>
                <td className="p-3">{p.variant?.product?.name} <span className="text-muted-foreground">({[p.variant?.ram, p.variant?.storage].filter(Boolean).join("/")})</span></td>
                <td className="p-3 text-muted-foreground">{p.retailer?.name}</td>
                <td className="p-3">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="p-3 capitalize text-muted-foreground">{p.availability.replace("_", " ")}</td>
                <td className="p-3 capitalize text-muted-foreground">{p.verification_status.replace("_", " ")}</td>
                <td className="p-3 text-muted-foreground">{formatRelativeTime(p.last_checked_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(prices ?? []).length === 0 && <p className="text-small text-muted-foreground">No price records match this filter.</p>}
      <p className="text-caption text-muted-foreground">Read-only monitoring view — editing individual price records is deferred to Phase 11's data pipeline.</p>
    </div>
  );
}
