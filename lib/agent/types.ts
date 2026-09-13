/**
 * A SourceProvider is the ONLY way real market data enters the agent
 * pipeline. Phase 11 ships with zero providers registered — see
 * providers/index.ts. Nothing in this pipeline fabricates a candidate;
 * an empty provider registry means every discovery run legitimately
 * finds 0 candidates, and says so.
 *
 * To connect a real source, implement this interface (e.g. an official
 * manufacturer API, an authorized retailer feed) and register it in
 * providers/index.ts. Do not scrape sites that disallow it, bypass
 * auth/CAPTCHAs, or exceed a source's stated rate limits (brief §24).
 */
export interface RawCandidate {
  /** Raw, as-observed values — not yet normalized or verified. */
  brandName: string;
  productName: string;
  modelIdentifier?: string;
  categorySlug: string; // e.g. 'smartphones'
  specs: Record<string, string>; // key = specification slug, value = raw observed value
  variants: Array<{ ram?: string; storage?: string; color?: string; modelNumber?: string }>;
  price?: { amount: number; currency: string; retailerName: string; productUrl: string; availability: string };
  sourceUrl: string;
  sourceName: string;
  sourceType: "manufacturer" | "retailer" | "official_documentation" | "trusted_publication" | "database" | "other";
  observedAt: string; // ISO timestamp
}

export interface SourceProvider {
  /** A short, stable identifier — used in logs and agent_actions. */
  id: string;
  /** Human-readable name shown in the admin panel. */
  name: string;
  /** Fetch whatever candidates this provider can currently see for a category. Must respect its own rate limits internally. */
  fetchCandidates(categorySlug: string): Promise<RawCandidate[]>;
}

export type PipelineStage =
  | "discover" | "fetch" | "normalize" | "identify" | "deduplicate"
  | "extract" | "verify" | "score_confidence" | "detect_conflicts"
  | "review" | "apply" | "publish";

export interface PipelineItemResult {
  candidate: RawCandidate;
  stage: PipelineStage;
  outcome: "created" | "updated" | "skipped" | "review_required" | "conflict" | "rejected" | "error";
  productId?: string;
  confidence?: number;
  reason?: string;
}

export interface PipelineRunSummary {
  discovered: number;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  reviewRequired: number;
  conflicts: number;
  errors: number;
}
