import { requireAdmin } from "@/lib/db/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { AutomationForm } from "@/components/admin/automation-form";

export default async function AdminAutomationPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: settings, error } = await supabase
    .from("automation_settings")
    .select("enabled, automation_mode, confidence_threshold, updated_at")
    .is("category_id", null)
    .maybeSingle();
  if (error) throw error;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Automation</h1>
      <p className="max-w-xl text-small text-muted-foreground">
        This is the global control switch for GadGexo's future autonomous data agent (Phase 11). It ships disabled, and nothing in Phases
        1–10 writes to this table automatically — only you, here.
      </p>
      <AutomationForm
        initial={settings ?? { enabled: false, automation_mode: "approval", confidence_threshold: 0.9, updated_at: null }}
      />
    </div>
  );
}
