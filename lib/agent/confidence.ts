import type { RawCandidate } from "./types";

// Higher = more trusted, mirrors sources.reliability_priority intent.
const SOURCE_TYPE_WEIGHT: Record<RawCandidate["sourceType"], number> = {
  manufacturer: 1.0,
  official_documentation: 0.95,
  retailer: 0.75,
  trusted_publication: 0.7,
  database: 0.6,
  other: 0.4,
};

export interface ConfidenceInput {
  candidate: RawCandidate;
  agreeingSourceCount: number; // how many independent sources reported the same core identity
  hasConflict: boolean;
  requiredFieldsPresent: number; // count of required fields (name, brand, category) actually populated
  requiredFieldsTotal: number;
}

/**
 * Documented formula — not a black box:
 *   base       = source-type weight (0.4–1.0)
 *   agreement  = +0.05 per additional agreeing source, capped at +0.2
 *   completeness = (fields present / fields required), weighted 0.2
 *   conflict penalty = -0.4 if sources disagree on identity/specs
 * Result is clamped to [0, 1] and rounded to 3 decimals to match the
 * confidence_score numeric(4,3) column.
 */
export function computeConfidence(input: ConfidenceInput): number {
  const base = SOURCE_TYPE_WEIGHT[input.candidate.sourceType];
  const agreementBonus = Math.min(0.2, Math.max(0, input.agreeingSourceCount - 1) * 0.05);
  const completeness = input.requiredFieldsTotal > 0 ? input.requiredFieldsPresent / input.requiredFieldsTotal : 0;
  const completenessScore = completeness * 0.2;
  const conflictPenalty = input.hasConflict ? 0.4 : 0;

  const raw = base * 0.7 + agreementBonus + completenessScore - conflictPenalty;
  return Math.round(Math.max(0, Math.min(1, raw)) * 1000) / 1000;
}

export function confidenceLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.85) return "high";
  if (score >= 0.6) return "medium";
  return "low";
}
