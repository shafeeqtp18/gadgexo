create table public.specification_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_specification_groups_updated_at
  before update on public.specification_groups
  for each row execute function public.set_updated_at();

create type public.specification_data_type as enum ('text', 'number', 'boolean', 'json');

create table public.specifications (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.specification_groups (id) on delete cascade,
  name        text not null,
  slug        text not null,
  unit        text,
  data_type   public.specification_data_type not null default 'text',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (group_id, slug)
);

create index specifications_group_id_idx on public.specifications (group_id);

create trigger set_specifications_updated_at
  before update on public.specifications
  for each row execute function public.set_updated_at();

-- Every individual spec VALUE carries its own provenance/verification —
-- not just the product as a whole. Two retailers can disagree about a
-- phone's battery capacity; this is where that lives until resolved.
create table public.product_specifications (
  id                    uuid primary key default gen_random_uuid(),
  product_id            uuid not null references public.products (id) on delete cascade,
  specification_id      uuid not null references public.specifications (id) on delete cascade,
  value                 text not null,
  numeric_value         numeric,
  boolean_value         boolean,
  source_id             uuid references public.sources (id) on delete set null,
  verification_status   public.verification_status not null default 'unverified',
  confidence_score      numeric(4, 3) check (confidence_score between 0 and 1),
  verified_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (product_id, specification_id)
);

create index product_specifications_product_id_idx on public.product_specifications (product_id);
create index product_specifications_specification_id_idx on public.product_specifications (specification_id);
create index product_specifications_verification_idx on public.product_specifications (verification_status);
create index product_specifications_numeric_value_idx
  on public.product_specifications (specification_id, numeric_value)
  where numeric_value is not null;

create trigger set_product_specifications_updated_at
  before update on public.product_specifications
  for each row execute function public.set_updated_at();
