import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductDetail, getRelatedProducts } from "@/lib/db/product-detail";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container, Section } from "@/components/layout/primitives";
import { VerificationBadge } from "@/components/data-display/status-indicator";
import { ProductGallery } from "@/components/product/gallery";
import { VariantPriceSection } from "@/components/product/variant-price-section";
import { QuickSpecs } from "@/components/product/quick-specs";
import { FullSpecifications } from "@/components/product/full-specifications";
import { VerificationNotice } from "@/components/product/verification-notice";
import { SourcesSection } from "@/components/product/sources-section";
import { PriceHistorySection } from "@/components/product/price-history";
import { RelatedProducts } from "@/components/product/related-products";
import { WishlistButton } from "@/components/product/wishlist-button";
import { CompareProvider, CompareBar, CompareCheckbox } from "@/components/catalogue/compare";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductDetail(params.slug);
  if (!product) return { title: "Product not found" };

  const title = `${product.name} — Specifications, Price & Details | GadGexo`;
  const description = product.short_description || `${product.brand?.name ?? ""} ${product.name} specifications, pricing and availability on GadGexo.`;
  const image = product.images.find((i) => i.is_primary) ?? product.images[0];

  return {
    title,
    description,
    alternates: { canonical: `/smartphones/${product.slug}` },
    openGraph: { title, description, images: image ? [image.image_url] : undefined },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductDetail(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.brand?.id ?? null, product.category?.id ?? null, 4);
  const baseVariant = product.variants[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: product.brand?.name,
    image: product.images.find((i) => i.is_primary)?.image_url,
    ...(baseVariant?.prices.some((p) => p.availability === "in_stock") && {
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: Math.min(...baseVariant.prices.filter((p) => p.availability === "in_stock").map((p) => p.price)),
        availability: "https://schema.org/InStock",
      },
    }),
  };

  return (
    <CompareProvider>
      <Section className="py-6 sm:py-10">
        <Container>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Smartphones", href: "/smartphones" },
              ...(product.brand ? [{ label: product.brand.name, href: `/smartphones?brand=${product.brand.slug}` }] : []),
              { label: product.name },
            ]}
            className="mb-6"
          />

          <div className="grid gap-10 lg:grid-cols-2">
            <ProductGallery images={product.images} productName={product.name} />

            <div className="flex flex-col gap-5">
              <div>
                {product.brand && <p className="text-small text-muted-foreground">{product.brand.name}</p>}
                <h1 className="text-h1">{product.name}</h1>
                {product.model_identifier && <p className="text-caption text-muted-foreground">{product.model_identifier}</p>}
              </div>

              <VerificationNotice status={product.verification_status} />

              {product.short_description && <p className="text-body text-muted-foreground">{product.short_description}</p>}

              <VariantPriceSection variants={product.variants} />

              <div className="flex items-center gap-2">
                <CompareCheckbox product={{ id: product.id, name: product.name, slug: product.slug }} />
                <WishlistButton />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-10">
            <QuickSpecs specGroups={product.specGroups} baseVariant={baseVariant} />
            <FullSpecifications specGroups={product.specGroups} />
            <PriceHistorySection variant={baseVariant} />
            <SourcesSection sources={product.sources} />
            <RelatedProducts products={related} />
          </div>
        </Container>
      </Section>
      <CompareBar />
    </CompareProvider>
  );
}
