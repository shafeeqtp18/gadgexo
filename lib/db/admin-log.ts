import { createClient } from "@/lib/supabase/server";

export async function logAdminAction(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: unknown;
  newData?: unknown;
}): Promise<void> {
  const supabase = createClient();
  await supabase.from("admin_logs").insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    old_data: params.oldData ?? null,
    new_data: params.newData ?? null,
  });
}
