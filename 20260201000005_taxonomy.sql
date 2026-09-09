create table public.brands (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  logo_url     text,
  website_url  text,
  description  text,
  country      text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint brands_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index brands_is_active_idx on public.brands (is_active);

create trigger set_brands_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- Self-referential so "Electronics > Smartphones > ..." style hierarchies
-- work for any future gadget category without a schema change.
create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  parent_id    uuid references public.categories (id) on delete set null,
  description  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint categories_not_own_parent check (id <> parent_id)
);

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_is_active_idx on public.categories (is_active);

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();
