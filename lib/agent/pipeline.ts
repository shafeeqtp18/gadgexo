import { createClient } from "@/lib/supabase/server";
import { REGISTERED_PROVIDERS } from "./providers";
import { computeConfidence } from "./confidence";
import { findExistingMatch } from "./dedupe";
import { normalizeSpecValue, normalizeBrandName, toSlug } from "./normalize";
import { createAgentAction, createReviewItem, createConflictRecord, getGlobalAutomationSettings } from "@/lib/db/agent";
import type { RawCandidate, PipelineRunSummary } from "./types";

async function findOrCreateSource(supabase: ReturnType<typeof createClient>, candidate: RawCandidate): Promise<string> {
  const { data: existing } = await supabase.from("sources").select("id").eq("name", candidate.sourceName).maybeSingle();
  if (existing) return existing.id;

  const domain = (() => {
    try { return new URL(candidate.sourceUrl).hostname; } catch { return null; }
  })();

  const { data: created, error } = await supabase
    .from("sources")
    .insert({ name: candidate.sourceName, domain, source_type: candidate.sourceType })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function recordObservation(supabase: ReturnType<typeof createClient>, sourceId: string, entityType: string, entityId: string | null, candidate: RawCandidate, agentRunId: string) {
  await supabase.from("source_observations").insert({
    source_id: sourceId,
    entity_type: entityType,
    entity_id: entityId,
    source_url: candidate.sourceUrl,
    raw_data: candidate as unknown as object,
    agent_run_id: agentRunId,
    retrieved_at: candidate.observedAt,
  });
}

/**
 * Runs the full pipeline for one category using every registered
 * provider. With REGISTERED_PROVIDERS empty (shipped state), this
 * legitimately discovers 0 candidates and returns a summary saying so —
 * it does not simulate or fabricate results.
 */
export async function runDiscoveryPipeline(agentRunId: string, categorySlug: string): Promise<PipelineRunSummary> {
  const supabase = createClient();
  const settings = await getGlobalAutomationSettings();

  const summary: PipelineRunSummary = { discovered: 0, processed: 0, created: 0, updated: 0, skipped: 0, reviewRequired: 0, conflicts: 0, errors: 0 };

  // --- DISCOVER + FETCH ---
  const candidates: RawCandidate[] = [];
  for (const provider of REGISTERED_PROVIDERS) {
    try {
      const found = await provider.fetchCandidates(categorySlug);
      candidates.push(...found);
    } catch {
      summary.errors += 1; // one bad provider must not kill the whole run (brief §36)
    }
  }
  summary.discovered = candidates.length;

  for (const raw of candidates) {
    summary.processed += 1;
    try {
      await processCandidate(supabase, agentRunId, raw, settings, summary);
    } catch {
      summary.errors += 1;
    }
  }

  return summary;
}

async function processCandidate(
  supabase: ReturnType<typeof createClient>,
  agentRunId: string,
  raw: RawCandidate,
  settings: { enabled: boolean; automation_mode: string; confidence_threshold: number },
  summary: PipelineRunSummary,
): Promise<void> {
  // --- NORMALIZE ---
  const normalizedSpecs: Record<string, string> = {};
  for (const [slug, value] of Object.entries(raw.specs)) normalizedSpecs[slug] = normalizeSpecValue(value, slug);
  const brandName = normalizeBrandName(raw.brandName);

  const sourceId = await findOrCreateSource(supabase, raw);

  // --- IDENTIFY / DEDUPLICATE ---
  const match = await findExistingMatch(raw);

  if (match.kind === "ambiguous") {
    const actionId = await createAgentAction({
      agentRunId, actionType: "PRODUCT_DISCOVERED", entityType: "product", entityId: null,
      proposedData: { ...raw, specs: normalizedSpecs }, confidenceScore: null, status: "pending",
    });
    await createReviewItem({ agentActionId: actionId, entityType: "product", entityId: null, reason: `Possible duplicate of ${match.candidateIds.length} existing product(s) — name matched but no exact model identifier.`, priority: 1 });
    summary.reviewRequired += 1;
    return;
  }

  // --- EXTRACT / VERIFY / SCORE CONFIDENCE ---
  const requiredFields = [raw.brandName, raw.productName, raw.categorySlug];
  const confidence = computeConfidence({
    candidate: raw,
    agreeingSourceCount: 1, // single-source per candidate at this stage — see Known Limitations
    hasConflict: false,
    requiredFieldsPresent: requiredFields.filter(Boolean).length,
    requiredFieldsTotal: requiredFields.length,
  });

  const canAutoApply = settings.enabled && settings.automation_mode !== "approval" && confidence >= settings.confidence_threshold;

  if (match.kind === "new") {
    const { data: brand } = await supabase.from("brands").select("id").ilike("name", brandName).maybeSingle();
    if (!brand) {
      // Unknown brand — never silently invent a new brand row's active status.
      const actionId = await createAgentAction({
        agentRunId, actionType: "PRODUCT_DISCOVERED", entityType: "product", entityId: null,
        proposedData: { ...raw, specs: normalizedSpecs }, confidenceScore: confidence, status: "pending",
      });
      await createReviewItem({ agentActionId: actionId, entityType: "product", entityId: null, reason: `Unrecognized brand "${brandName}" — needs manual brand setup before this product can be created.`, priority: 2 });
      summary.reviewRequired += 1;
      return;
    }

    const { data: category } = await supabase.from("categories").select("id").eq("slug", raw.categorySlug).maybeSingle();
    const status = canAutoApply ? "published" : "draft";

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        brand_id: brand.id,
        category_id: category?.id ?? null,
        name: raw.productName,
        slug: toSlug(`${brandName}-${raw.productName}`),
        model_identifier: raw.modelIdentifier ?? null,
        status,
        verification_status: canAutoApply ? "partially_verified" : "unverified",
        confidence_score: confidence,
        discovered_at: raw.observedAt,
      })
      .select("id")
      .single();
    if (error) throw error;

    await recordObservation(supabase, sourceId, "product", product.id, raw, agentRunId);

    const actionId = await createAgentAction({
      agentRunId, actionType: "PRODUCT_CREATED", entityType: "product", entityId: product.id,
      proposedData: { ...raw, specs: normalizedSpecs }, confidenceScore: confidence, status: canAutoApply ? "auto_applied" : "pending",
    });

    if (!canAutoApply) {
      await createReviewItem({ agentActionId: actionId, entityType: "product", entityId: product.id, reason: "New product discovered — awaiting review before publishing.", priority: 0 });
      summary.reviewRequired += 1;
    }
    summary.created += 1;
    return;
  }

  // --- match.kind === "existing": compare against current verified data, never silently overwrite ---
  const productId = match.productId;
  let hadConflict = false;

  for (const [specSlug, newValue] of Object.entries(normalizedSpecs)) {
    const { data: spec } = await supabase.from("specifications").select("id").eq("slug", specSlug).maybeSingle();
    if (!spec) continue; // unknown spec slug — skip rather than inventing a new specification definition

    const { data: existingValue } = await supabase
      .from("product_specifications")
      .select("id, value, verification_status")
      .eq("product_id", productId)
      .eq("specification_id", spec.id)
      .maybeSingle();

    if (!existingValue) {
      await supabase.from("product_specifications").insert({
        product_id: productId, specification_id: spec.id, value: newValue, source_id: sourceId,
        verification_status: "unverified", confidence_score: confidence,
      });
      continue;
    }

    if (existingValue.value !== newValue && existingValue.verification_status !== "unverified") {
      await createConflictRecord({
        entityType: "product_specification", entityId: existingValue.id, fieldName: specSlug,
        conflictingValues: [{ source_id: null, value: existingValue.value }, { source_id: sourceId, value: newValue }],
      });
      hadConflict = true;
    }
  }

  if (hadConflict) {
    const actionId = await createAgentAction({
      agentRunId, actionType: "CONFLICT_DETECTED", entityType: "product", entityId: productId,
      proposedData: { ...raw, specs: normalizedSpecs }, confidenceScore: confidence, status: "pending",
    });
    await createReviewItem({ agentActionId: actionId, entityType: "product", entityId: productId, reason: "New observation conflicts with existing verified data.", priority: 2 });
    summary.conflicts += 1;
    return;
  }

  await recordObservation(supabase, sourceId, "product", productId, raw, agentRunId);
  await createAgentAction({
    agentRunId, actionType: "PRODUCT_UPDATED", entityType: "product", entityId: productId,
    proposedData: { ...raw, specs: normalizedSpecs }, confidenceScore: confidence, status: canAutoApply ? "auto_applied" : "pending",
  });
  summary.updated += 1;
}
