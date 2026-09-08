import { NextResponse } from "next/server";

/**
 * Minimal deployment health check. Confirms required env vars are
 * *present* without ever revealing their values — safe to leave public.
 */
export async function GET() {
  const requiredPublicVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missing = requiredPublicVars.filter((key) => !process.env[key]);

  return NextResponse.json({
    status: missing.length === 0 ? "ok" : "misconfigured",
    missingEnvVars: missing, // names only, never values
    timestamp: new Date().toISOString(),
  });
}
