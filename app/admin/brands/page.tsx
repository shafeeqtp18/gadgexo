import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { NameSlugManager } from "@/components/admin/name-slug-manager";
import { upsertBrandAction } from "@/lib/actions/admin";

export default async function AdminBrandsPage() {
  await requireStaff();
  const supabase = createClient();

  const { data: brands, error } = await supabase.from("brands").select("id, name, slug, is_active").order("name");
  if (error) throw error;

  const { data: products } = await supabase.from("products").select("brand_id");
  const counts = new Map<string, number>();
  for (const p of products ?? []) counts.set(p.brand_id, (counts.get(p.brand_id) ?? 0) + 1);

  const items = (brands ?? []).map((b) => ({ ...b, productCount: counts.get(b.id) ?? 0 }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Brands ({items.length})</h1>
      <NameSlugManager items={items} action={upsertBrandAction} itemLabel="Brand" />
    </div>
  );
}
