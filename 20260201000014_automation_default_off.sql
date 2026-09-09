-- The global automation switch must exist and default to OFF from the
-- moment this schema is applied — not left absent until someone
-- remembers to create it. This is safety configuration, not demo data,
-- so it lives in a migration rather than supabase/seed/seed.sql.
insert into public.automation_settings (category_id, enabled, automation_mode, confidence_threshold)
values (null, false, 'approval', 0.900)
on conflict (category_id) do nothing;
