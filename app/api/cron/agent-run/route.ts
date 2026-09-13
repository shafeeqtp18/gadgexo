import { NextResponse } from "next/server";
import { createAgentRun, completeAgentRun, getGlobalAutomationSettings } from "@/lib/db/agent";
import { runDiscoveryPipeline } from "@/lib/agent/pipeline";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  // No CRON_SECRET configured means this endpoint is not yet wired up —
  // fail closed rather than silently allowing unauthenticated triggers.
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getGlobalAutomationSettings();
  if (!settings.enabled) {
    return NextResponse.json({ skipped: true, reason: "Automation is disabled in /admin/automation." });
  }

  const runId = await createAgentRun({ agentName: "smartphone-discovery-agent", runType: "discovery", triggeredBy: null });

  try {
    const summary = await runDiscoveryPipeline(runId, "smartphones");
    await completeAgentRun(runId, "completed", summary);
    return NextResponse.json({ runId, summary });
  } catch (err) {
    await completeAgentRun(runId, "failed", { error: err instanceof Error ? err.message : "Unknown error" });
    return NextResponse.json({ runId, error: "Run failed" }, { status: 500 });
  }
}
