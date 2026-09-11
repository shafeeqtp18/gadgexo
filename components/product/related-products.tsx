import { ProductCard } from "@/components/data-display/product-card";

export function RelatedProducts({ products }: { products: any[] }) {
  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-h3">Related Smartphones</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
