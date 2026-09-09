import { createClient } from "@/lib/supabase/server";
import type { AutomationSettings } from "@/types/domain";

/**
 * Reads the global automation switch (category_id = null row). Nothing
 * in Phase 2 calls this from the UI yet — it exists so Phase 10 (admin)
 * and Phase 11 (agent) have a ready-made, RLS-correct way to check it
 * instead of querying automation_settings ad hoc.
 */
export async function getGlobalAutomationSettings(): Promise<AutomationSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("automation_settings")
    .select("*")
    .is("category_id", null)
    .maybeSingle();
  if (error) throw error;
  return data;
}
