import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Container, Section } from "@/components/layout/primitives";
import { ProductCard } from "@/components/data-display/product-card";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata: Metadata = { title: "Smartphones" };

async function getSmartphones(query?: string) {
  const supabase = createClient();
  let q = supabase
    .from("products")
    .select("id, name, slug, verification_status, brand:brands(name), images:product_images(image_url, is_primary)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (query) q = q.ilike("name", `%${query}%`);

  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export default async function SmartphonesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const products = await getSmartphones(searchParams.q);

  return (
    <Section className="py-10">
      <Container>
        <h1 className="mb-1 text-h1">Smartphones</h1>
        <p className="mb-6 text-small text-muted-foreground">
          {searchParams.q
            ? `Results for "${searchParams.q}"`
            : "Filters, sorting, and pagination are coming in a future update — this is the full published catalog for now."}
        </p>
        {products.length === 0 ? (
          <EmptyState title="No gadgets found." description="Try another model name or check back later." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </Container>
    </Section>
  );
}
