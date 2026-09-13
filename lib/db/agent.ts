import { createClient } from "@/lib/supabase/server";
import type { PipelineRunSummary } from "@/lib/agent/types";

export async function createAgentRun(params: { agentName: string; runType: string; triggeredBy: string | null }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_runs")
    .insert({ agent_name: params.agentName, run_type: params.runType, triggered_by: params.triggeredBy, status: "running" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function completeAgentRun(runId: string, status: "completed" | "failed" | "cancelled", summary: PipelineRunSummary | { error: string }) {
  const supabase = createClient();
  await supabase.from("agent_runs").update({ status, completed_at: new Date().toISOString(), summary }).eq("id", runId);
}

export async function createAgentAction(params: {
  agentRunId: string;
  actionType: string;
  entityType: string;
  entityId: string | null;
  previousData?: unknown;
  proposedData: unknown;
  confidenceScore: number | null;
  status: "pending" | "approved" | "rejected" | "auto_applied";
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_actions")
    .insert({
      agent_run_id: params.agentRunId,
      action_type: params.actionType,
      entity_type: params.entityType,
      entity_id: params.entityId,
      previous_data: params.previousData ?? null,
      proposed_data: params.proposedData,
      confidence_score: params.confidenceScore,
      status: params.status,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function createReviewItem(params: { agentActionId: string; entityType: string; entityId: string | null; reason: string; priority?: number }) {
  const supabase = createClient();
  await supabase.from("review_queue").insert({
    agent_action_id: params.agentActionId,
    entity_type: params.entityType,
    entity_id: params.entityId,
    reason: params.reason,
    priority: params.priority ?? 0,
  });
}

export async function createConflictRecord(params: { entityType: string; entityId: string; fieldName: string; conflictingValues: Array<{ source_id: string | null; value: string }> }) {
  const supabase = createClient();
  await supabase.from("data_conflicts").insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    field_name: params.fieldName,
    conflicting_values: params.conflictingValues,
  });
}

export async function getGlobalAutomationSettings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("automation_settings")
    .select("enabled, automation_mode, confidence_threshold")
    .is("category_id", null)
    .maybeSingle();
  if (error) throw error;
  return data ?? { enabled: false, automation_mode: "approval" as const, confidence_threshold: 0.9 };
}

export async function getRecentAgentRuns(limit = 20) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_runs")
    .select("id, agent_name, run_type, status, started_at, completed_at, summary")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getAgentRunDetail(runId: string) {
  const supabase = createClient();
  const { data: run, error: runError } = await supabase.from("agent_runs").select("*").eq("id", runId).maybeSingle();
  if (runError) throw runError;
  if (!run) return null;

  const { data: actions, error: actionsError } = await supabase
    .from("agent_actions")
    .select("id, action_type, entity_type, entity_id, confidence_score, status, created_at")
    .eq("agent_run_id", runId)
    .order("created_at", { ascending: false });
  if (actionsError) throw actionsError;

  return { run, actions: actions ?? [] };
}
