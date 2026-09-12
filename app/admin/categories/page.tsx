import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { NameSlugManager } from "@/components/admin/name-slug-manager";
import { upsertCategoryAction } from "@/lib/actions/admin";

export default async function AdminCategoriesPage() {
  await requireStaff();
  const supabase = createClient();

  const { data: categories, error } = await supabase.from("categories").select("id, name, slug, is_active").order("name");
  if (error) throw error;

  const { data: products } = await supabase.from("products").select("category_id");
  const counts = new Map<string, number>();
  for (const p of products ?? []) if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);

  const items = (categories ?? []).map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Categories ({items.length})</h1>
      <p className="text-small text-muted-foreground">
        Ready for future gadget categories beyond smartphones — add a category here and it becomes available across the schema immediately.
      </p>
      <NameSlugManager items={items} action={upsertCategoryAction} itemLabel="Category" />
    </div>
  );
}
