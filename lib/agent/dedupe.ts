import { createClient } from "@/lib/supabase/server";
import { normalizeBrandName, toSlug } from "./normalize";
import type { RawCandidate } from "./types";

export type IdentityMatch =
  | { kind: "existing"; productId: string; confidence: "high" }
  | { kind: "ambiguous"; candidateIds: string[]; confidence: "low" }
  | { kind: "new" };

/**
 * High-confidence match: same brand + an exact model_identifier match.
 * Anything less certain (name-only similarity) is returned as
 * "ambiguous" for human review — never auto-merged, per brief §11's
 * explicit example (differently-worded names for the same phone must
 * not be silently treated as identical OR silently treated as new).
 */
export async function findExistingMatch(candidate: RawCandidate): Promise<IdentityMatch> {
  const supabase = createClient();
  const brandName = normalizeBrandName(candidate.brandName);

  const { data: brand } = await supabase.from("brands").select("id").ilike("name", brandName).maybeSingle();
  if (!brand) return { kind: "new" }; // unknown brand — nothing to match against yet

  if (candidate.modelIdentifier) {
    const { data: exact } = await supabase
      .from("products")
      .select("id")
      .eq("brand_id", brand.id)
      .eq("model_identifier", candidate.modelIdentifier)
      .maybeSingle();
    if (exact) return { kind: "existing", productId: exact.id, confidence: "high" };
  }

  // No model_identifier match — check for name-similar candidates under the
  // same brand and flag as ambiguous rather than guessing.
  const candidateSlug = toSlug(candidate.productName);
  const { data: similar } = await supabase.from("products").select("id, slug").eq("brand_id", brand.id);
  const nearMatches = (similar ?? []).filter((p) => p.slug.includes(candidateSlug) || candidateSlug.includes(p.slug));

  if (nearMatches.length > 0) return { kind: "ambiguous", candidateIds: nearMatches.map((p) => p.id), confidence: "low" };
  return { kind: "new" };
}
