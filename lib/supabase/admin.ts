import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Privileged Supabase client using the SERVICE ROLE key. Bypasses Row
 * Level Security entirely — this is the pattern future admin actions
 * and the Phase 11 automation agent will use for privileged writes.
 *
 * Security boundary (Master Context §14/§16):
 * - The `server-only` import above makes an accidental client-side
 *   import fail the build, not just fail silently at runtime.
 * - SUPABASE_SERVICE_ROLE_KEY must NEVER be prefixed NEXT_PUBLIC_ and
 *   must never be referenced from any file under app/**\/page.tsx
 *   client boundaries or components marked "use client".
 * - Nothing in this Phase 1 foundation calls this function yet — it
 *   exists so later phases have a correct, pre-vetted pattern to use
 *   rather than inventing their own service-role access each time.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
