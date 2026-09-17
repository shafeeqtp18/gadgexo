import { createClient } from "@/lib/supabase/server";

export type CatalogueMatchStatus =
  | "exact_match"
  | "strong_match"
  | "possible_match"
  | "new_product";

export interface CatalogueMatch {
  status: CatalogueMatchStatus;
  confidence: number;
  matchedProductId: string | null;
  matchedProductName: string | null;
  reason: string;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value: string): string {
  return normalize(value).replace(/\s+/g, "");
}

function tokenSet(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter(Boolean));
}

function similarity(a: string, b: string): number {
  const ca = compact(a);
  const cb = compact(b);

  if (!ca || !cb) return 0;
  if (ca === cb) return 100;
  if (ca.includes(cb) || cb.includes(ca)) return 90;

  const aTokens = tokenSet(a);
  const bTokens = tokenSet(b);

  if (!aTokens.size || !bTokens.size) return 0;

  let common = 0;

  for (const token of aTokens) {
    if (bTokens.has(token)) common++;
  }

  return Math.round(
    (2 * common) / (aTokens.size + bTokens.size) * 100
  );
}

export async function findCatalogueMatch(params: {
  brand: string;
  productName: string;
  modelIdentifier?: string | null;
  categorySlug?: string | null;
}): Promise<CatalogueMatch> {
  const supabase = createClient();

  const brand = normalize(params.brand);
  const productName = normalize(params.productName);
  const modelIdentifier = params.modelIdentifier
    ? normalize(params.modelIdentifier)
    : "";

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, brand_id, category_id")
    .limit(500);

  if (error) {
    throw error;
  }

  if (!products?.length) {
    return {
      status: "new_product",
      confidence: 100,
      matchedProductId: null,
      matchedProductName: null,
      reason: "Catalogue is empty; no existing product matched.",
    };
  }

  const brandIds = [
    ...new Set(
      products
        .map((product) => product.brand_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const brandsById = new Map<string, string>();

  if (brandIds.length) {
    const { data: brands, error: brandError } = await supabase
      .from("brands")
      .select("id, name")
      .in("id", brandIds);

    if (brandError) {
      throw brandError;
    }

    for (const item of brands ?? []) {
      brandsById.set(item.id, item.name);
    }
  }

  let bestProduct: {
    id: string;
    name: string;
    score: number;
  } | null = null;

  for (const product of products) {
    const productBrand = product.brand_id
      ? brandsById.get(product.brand_id) ?? ""
      : "";

    const brandScore = similarity(brand, productBrand);
    const nameScore = similarity(productName, product.name ?? "");

    let score = Math.round(
      brandScore * 0.35 + nameScore * 0.65
    );

    if (
      modelIdentifier &&
      compact(product.name ?? "").includes(compact(modelIdentifier))
    ) {
      score = Math.min(100, score + 10);
    }

    if (!bestProduct || score > bestProduct.score) {
      bestProduct = {
        id: product.id,
        name: product.name,
        score,
      };
    }
  }

  if (!bestProduct || bestProduct.score < 55) {
    return {
      status: "new_product",
      confidence: 100 - (bestProduct?.score ?? 0),
      matchedProductId: null,
      matchedProductName: null,
      reason:
        "No sufficiently similar existing catalogue product was found.",
    };
  }

  if (bestProduct.score >= 95) {
    return {
      status: "exact_match",
      confidence: bestProduct.score,
      matchedProductId: bestProduct.id,
      matchedProductName: bestProduct.name,
      reason:
        "Brand and product name strongly match an existing catalogue product.",
    };
  }

  if (bestProduct.score >= 80) {
    return {
      status: "strong_match",
      confidence: bestProduct.score,
      matchedProductId: bestProduct.id,
      matchedProductName: bestProduct.name,
      reason:
        "The researched product strongly resembles an existing catalogue product.",
    };
  }

  return {
    status: "possible_match",
    confidence: bestProduct.score,
    matchedProductId: bestProduct.id,
    matchedProductName: bestProduct.name,
    reason:
      "A possible catalogue match was found, but human review is recommended.",
  };
}