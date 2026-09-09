create type public.product_status as enum ('draft', 'review', 'published', 'archived', 'rejected');

create table public.products (
  id                   uuid primary key default gen_random_uuid(),
  brand_id             uuid not null references public.brands (id) on delete restrict,
  category_id          uuid not null references public.categories (id) on delete restrict,
  name                 text not null,
  slug                 text not null unique,
  model_identifier     text,          -- manufacturer's own model code, e.g. "A3108"
  short_description    text,
  description          text,
  status               public.product_status not null default 'draft',
  is_featured          boolean not null default false,
  is_trending          boolean not null default false,

  -- Provenance/trust — a product discovered by the future agent starts
  -- 'unverified'; an admin (or a high-confidence auto rule in Phase 11)
  -- moves it toward 'verified'. NEVER default this to 'verified'.
  verification_status  public.verification_status not null default 'unverified',
  confidence_score      numeric(4, 3) check (confidence_score between 0 and 1),

  announcement_date    date,
  release_date         date,
  india_release_date   date,
  discovered_at        timestamptz,   -- when the agent first found this (null = manually created)
  verified_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index products_brand_id_idx on public.products (brand_id);
create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);
create index products_verification_status_idx on public.products (verification_status);
create index products_featured_idx on public.products (is_featured) where is_featured;
create index products_trending_idx on public.products (is_trending) where is_trending;

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create type public.variant_availability as enum ('in_stock', 'out_of_stock', 'coming_soon', 'discontinued');

create table public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  ram            text,
  storage        text,
  storage_type   text,
  color          text,
  color_hex      text,
  region         text,             -- e.g. 'India', 'Global' — for region-specific variant differences
  model_number   text,
  sku            text,
  availability   public.variant_availability not null default 'coming_soon',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint product_variants_color_hex_format
    check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

create index product_variants_product_id_idx on public.product_variants (product_id);
create unique index product_variants_sku_unique_idx
  on public.product_variants (sku) where sku is not null;
create unique index product_variants_unique_config_idx
  on public.product_variants (product_id, ram, storage, color, region);

create trigger set_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();
