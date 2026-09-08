import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client-side Supabase instance. Uses only the PUBLIC anon key — safe
 * to ship to the browser. Row Level Security (built in Phase 2) is
 * what actually enforces what this client can read/write.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
