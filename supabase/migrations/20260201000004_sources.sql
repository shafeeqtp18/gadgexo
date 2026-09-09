-- ============================================================
-- Sources & provenance
-- ============================================================
-- A registry of where factual data can come from, plus a log of every
-- individual fetch/observation. Any future agent action should be able
-- to point back to the observation(s) that justified it.

create table public.sources (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  domain                text,
  source_type           public.source_type not null default 'other',
  -- Higher = more trusted. Lets the future agent prefer manufacturer
  -- pages over forum posts without hard-coding domain names anywhere.
  reliability_priority  smallint not null default 0,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index sources_domain_idx on public.sources (domain);
create index sources_is_active_idx on public.sources (is_active);

create trigger set_sources_updated_at
  before update on public.sources
  for each row execute function public.set_updated_at();

-- One row per individual fetch. entity_type/entity_id are a loose
-- reference (no FK) on purpose — an observation might describe a
-- product that doesn't exist in our DB yet (that's the whole point of
-- "discovery"), so it can't require a foreign key to something that
-- may not be created until the observation is reviewed.
create table public.source_observations (
  id            uuid primary key default gen_random_uuid(),
  source_id     uuid not null references public.sources (id) on delete restrict,
  entity_type   text not null,       -- e.g. 'product', 'price', 'specification'
  entity_id     uuid,                -- null if the entity doesn't exist yet
  source_url    text,
  raw_data      jsonb not null default '{}',
  agent_run_id  uuid,                -- fk added after agent_runs exists (migration 010)
  retrieved_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index source_observations_source_id_idx on public.source_observations (source_id);
create index source_observations_entity_idx on public.source_observations (entity_type, entity_id);
create index source_observations_agent_run_id_idx on public.source_observations (agent_run_id);
