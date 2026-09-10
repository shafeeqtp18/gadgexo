import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/lib/db/products";
import { Container, Section } from "@/components/layout/primitives";
import { VerificationBadge } from "@/components/data-display/status-indicator";
import { SpecGroup, KeyValueRow } from "@/components/data-display/spec-row";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];

  return (
    <Section className="py-8">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Smartphones", href: "/smartphones" },
            { label: product.name },
          ]}
          className="mb-6"
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface-elevated">
            {primaryImage && (
              <Image src={primaryImage.image_url} alt={product.name} fill className="object-cover" />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-small text-muted-foreground">{product.brand.name}</p>
            <h1 className="text-h1">{product.name}</h1>
            <VerificationBadge status={product.verification_status} />
            {product.short_description && (
              <p className="text-body text-muted-foreground">{product.short_description}</p>
            )}
            <p className="mt-4 text-caption text-muted-foreground">
              Full pricing, variant selection, and price history charts are coming in a future update.
            </p>
          </div>
        </div>

        {product.specificationGroups.length > 0 && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {product.specificationGroups.map(({ group, specs }) => (
              <SpecGroup key={group.id} title={group.name}>
                {specs.map(({ specification, value }) => (
                  <KeyValueRow
                    key={specification.id}
                    label={specification.name}
                    value={specification.unit ? `${value.value} ${specification.unit}` : value.value}
                  />
                ))}
              </SpecGroup>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
