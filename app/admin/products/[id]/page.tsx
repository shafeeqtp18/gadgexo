import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { AdminProductForm } from "@/components/admin/product-form";

export default async function AdminProductEditPage({ params }: { params: { id: string } }) {
  await requireStaff();
  const supabase = createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, short_description, status, verification_status, brand:brands(name), category:categories(name)")
    .eq("id", params.id)
    .maybeSingle();
  if (error) throw error;
  if (!product) notFound();

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, ram, storage, availability")
    .eq("product_id", params.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h1">{product.name}</h1>
        <p className="text-small text-muted-foreground">
          {(product as any).brand?.name} · {(product as any).category?.name} · verification: {product.verification_status}
        </p>
      </div>

      <AdminProductForm
        productId={product.id}
        initial={{ name: product.name, short_description: product.short_description ?? "", status: product.status }}
      />

      <div>
        <h2 className="mb-2 text-h3">Variants</h2>
        {(variants ?? []).length === 0 ? (
          <p className="text-small text-muted-foreground">No variants.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-small">
            {(variants ?? []).map((v) => (
              <li key={v.id} className="flex justify-between p-3">
                <span>{[v.ram, v.storage].filter(Boolean).join(" / ")}</span>
                <span className="text-muted-foreground capitalize">{v.availability.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-caption text-muted-foreground">Variant/price editing UI is deferred — Phase 11 will manage this data directly.</p>
      </div>
    </div>
  );
}
