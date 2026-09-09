-- Shared enums, defined once so multiple tables (specs, prices, products)
-- can reference the same verification vocabulary consistently.

create type public.verification_status as enum (
  'unverified',
  'partially_verified',
  'verified',
  'conflicting',
  'needs_review'
);

create type public.source_type as enum (
  'manufacturer',
  'retailer',
  'official_documentation',
  'trusted_publication',
  'database',
  'other'
);

create type public.agent_run_status as enum ('running', 'completed', 'failed', 'cancelled');

create type public.agent_action_status as enum ('pending', 'approved', 'rejected', 'auto_applied');

create type public.review_status as enum ('pending', 'in_review', 'approved', 'rejected');

create type public.automation_mode as enum ('approval', 'smart_auto', 'full_auto');
