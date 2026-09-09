-- ============================================================
-- Autonomous agent foundation (tables only — no agent code here)
-- ============================================================
-- Phase 2 scope is deliberately limited to making Phase 11 possible
-- without a schema rewrite. Nothing writes to these tables yet.

create table public.agent_runs (
  id            uuid primary key default gen_random_uuid(),
  agent_name    text not null,        -- e.g. 'smartphone-discovery-agent'
  run_type      text not null,        -- e.g. 'discovery', 'price_check', 'verification'
  status        public.agent_run_status not null default 'running',
  triggered_by  uuid references public.profiles (id) on delete set null,  -- null = scheduled
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  summary       jsonb,
  created_at    timestamptz not null default now()
);

create index agent_runs_status_idx on public.agent_runs (status);
create index agent_runs_started_at_idx on public.agent_runs (started_at desc);

-- Now that agent_runs exists, wire up the FK left pending in migration 004.
alter table public.source_observations
  add constraint source_observations_agent_run_id_fkey
  foreign key (agent_run_id) references public.agent_runs (id) on delete set null;

-- Every proposed change the agent wants to make. Nothing here is applied
-- to the real tables until it's approved (or auto-applied under a
-- confidence threshold the owner explicitly configured — see
-- automation_settings below).
create table public.agent_actions (
  id             uuid primary key default gen_random_uuid(),
  agent_run_id   uuid not null references public.agent_runs (id) on delete cascade,
  action_type    text not null,        -- e.g. 'create_product', 'update_price', 'create_variant'
  entity_type    text not null,
  entity_id      uuid,                 -- null for a proposed *new* row
  previous_data  jsonb,
  proposed_data  jsonb not null,
  confidence_score numeric(4, 3) check (confidence_score between 0 and 1),
  status         public.agent_action_status not null default 'pending',
  reviewed_by    uuid references public.profiles (id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);

create index agent_actions_agent_run_id_idx on public.agent_actions (agent_run_id);
create index agent_actions_status_idx on public.agent_actions (status);
create index agent_actions_entity_idx on public.agent_actions (entity_type, entity_id);

-- What an admin actually sees on the review screen. Usually created
-- alongside an agent_action, but kept as its own table because not
-- every review item originates from the agent (e.g. a user-reported
-- data conflict could land here too).
create table public.review_queue (
  id              uuid primary key default gen_random_uuid(),
  agent_action_id uuid references public.agent_actions (id) on delete cascade,
  entity_type     text not null,
  entity_id       uuid,
  reason          text not null,
  priority        smallint not null default 0,
  status          public.review_status not null default 'pending',
  assigned_to     uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz,
  resolved_by     uuid references public.profiles (id) on delete set null
);

create index review_queue_status_idx on public.review_queue (status);
create index review_queue_priority_idx on public.review_queue (priority desc);

-- Structured record of "source A says X, source B says Y" — distinct
-- from review_queue because a conflict can exist and be tracked before
-- anyone decides it needs human review.
create table public.data_conflicts (
  id                  uuid primary key default gen_random_uuid(),
  entity_type         text not null,
  entity_id           uuid not null,
  field_name          text not null,
  conflicting_values  jsonb not null,   -- e.g. [{"source_id": "...", "value": "6.7"}, {"source_id": "...", "value": "6.8"}]
  status              text not null default 'open' check (status in ('open', 'resolved', 'ignored')),
  resolved_by         uuid references public.profiles (id) on delete set null,
  resolved_at         timestamptz,
  created_at          timestamptz not null default now()
);

create index data_conflicts_entity_idx on public.data_conflicts (entity_type, entity_id);
create index data_conflicts_status_idx on public.data_conflicts (status);

-- Owner-controlled automation switch. One global row (category_id null)
-- plus optional per-category overrides. SAFE DEFAULT: disabled, approval
-- mode — nothing auto-publishes until the owner explicitly changes this.
create table public.automation_settings (
  id                   uuid primary key default gen_random_uuid(),
  category_id          uuid references public.categories (id) on delete cascade,
  enabled              boolean not null default false,
  automation_mode      public.automation_mode not null default 'approval',
  confidence_threshold numeric(4, 3) not null default 0.900 check (confidence_threshold between 0 and 1),
  config               jsonb not null default '{}',  -- schedules, enabled source types, enabled markets, etc.
  updated_by           uuid references public.profiles (id) on delete set null,
  updated_at           timestamptz not null default now(),
  unique (category_id)
);

create trigger set_automation_settings_updated_at
  before update on public.automation_settings
  for each row execute function public.set_updated_at();

comment on table public.automation_settings is
  'Owner-controlled automation switch. A row with category_id = null is the global default. Ships disabled (enabled=false, mode=approval) — Phase 11 must not silently flip this.';
