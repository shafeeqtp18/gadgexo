/**
 * Placeholder for Supabase-generated types. Phase 2 builds the actual
 * database schema; once it exists on a real Supabase project, replace
 * this file with the real output of:
 *
 *   supabase gen types typescript --project-id <ref> --schema public
 *
 * (No terminal on your side needed for that — it can be run from
 * GitHub Actions or documented as a one-time browser/dashboard step
 * when Phase 2 is implemented.)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
