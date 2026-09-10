import { Breadcrumb } from "@/components/ui/breadcrumb";

export function CatalogueHeader({ total, q }: { total: number; q?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Smartphones" }]} />
      <h1 className="text-h1">Smartphones</h1>
      <p className="text-small text-muted-foreground">
        {q
          ? `${total} result${total === 1 ? "" : "s"} for "${q}"`
          : "Explore smartphones by brand, specifications, price and more."}
      </p>
    </div>
  );
}
