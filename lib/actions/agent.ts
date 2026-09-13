"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/db/admin-auth";
import { createAgentRun, completeAgentRun } from "@/lib/db/agent";
import { runDiscoveryPipeline } from "@/lib/agent/pipeline";
import { REGISTERED_PROVIDERS } from "@/lib/agent/providers";

export interface TriggerRunResult {
  error?: string;
  runId?: string;
  noProviderWarning?: boolean;
}

/** Public users can never reach this — requireAdmin() is independently re-checked here, not just at the page level (brief §37, §21). */
export async function triggerDiscoveryRunAction(categorySlug: string): Promise<TriggerRunResult> {
  const admin = await requireAdmin();

  const runId = await createAgentRun({ agentName: "smartphone-discovery-agent", runType: "discovery", triggeredBy: admin.id });

  try {
    const summary = await runDiscoveryPipeline(runId, categorySlug);
    await completeAgentRun(runId, "completed", summary);
    revalidatePath("/admin/automation");
    revalidatePath("/admin/automation/runs");
    return { runId, noProviderWarning: REGISTERED_PROVIDERS.length === 0 };
  } catch (err) {
    await completeAgentRun(runId, "failed", { error: err instanceof Error ? err.message : "Unknown error" });
    return { error: "The run failed — check the run detail page for what was logged before the failure." };
  }
}
