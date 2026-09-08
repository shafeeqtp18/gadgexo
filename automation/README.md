# Reserved for Phase 11 — Autonomous Market Intelligence / Data Agent

This folder intentionally contains no code yet. It exists so Phase 11
has an obvious, pre-agreed home rather than needing to restructure the
project later.

**What will eventually live here** (per the Master Context, §4–§5):
discovery jobs, source ingestion, verification/confidence-scoring
logic, duplicate/conflict detection, and admin review-queue writers.

**What actually enables this today** (already true after Phase 1):
- `lib/supabase/admin.ts` — the service-role client any background job
  will use for privileged writes.
- Supabase itself supports scheduled Edge Functions / `pg_cron`, which
  is the realistic place these jobs will run (not a Claude chat session
  and not this Next.js app's request/response cycle).

**What is NOT true today** (do not assume otherwise): no scheduler,
no job runner, no source-tracking tables, no agent code exist yet.
Phase 2 adds the database concepts (`sources`, verification status,
etc.); Phase 11 adds the actual agent logic.
