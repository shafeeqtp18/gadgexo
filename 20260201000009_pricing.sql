create table public.retailers (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null unique,
  domain             text,
  country            text default 'India',
  logo_url           text,
  website_url        text,
  affiliate_metadata jsonb,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint retailers_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create trigger set_retailers_updated_at
  before update on public.retailers
  for each row execute function public.set_updated_at();

create type public.price_availability as enum ('in_stock', 'out_of_stock', 'coming_soon', 'discontinued');

-- Current/live price per (variant, retailer). Every meaningful change
-- should also be appended to price_history (application/agent layer
-- does both writes together, not a trigger — a trigger can't know
-- whether a change is "meaningful" per the brief's own requirement).
create table public.prices (
  id                    uuid primary key default gen_random_uuid(),
  variant_id            uuid not null references public.product_variants (id) on delete cascade,
  retailer_id           uuid not null references public.retailers (id) on delete restrict,
  price                 numeric(12, 2) not null check (price >= 0),
  mrp                   numeric(12, 2) check (mrp >= 0),
  previous_price        numeric(12, 2) check (previous_price >= 0),
  discount_percent      numeric(5, 2) generated always as (
    case when mrp is not null and mrp > 0 then round(((mrp - price) / mrp) * 100, 2) else null end
  ) stored,
  currency              text not null default 'INR' check (char_length(currency) = 3),
  product_url           text not null check (char_length(product_url) > 0),
  availability          public.price_availability not null default 'in_stock',
  source_id             uuid references public.sources (id) on delete set null,
  verification_status   public.verification_status not null default 'unverified',
  confidence_score      numeric(4, 3) check (confidence_score between 0 and 1),
  observed_at           timestamptz not null default now(),
  last_checked_at       timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (variant_id, retailer_id)
);

create index prices_variant_id_idx on public.prices (variant_id);
create index prices_retailer_id_idx on public.prices (retailer_id);
create index prices_verification_status_idx on public.prices (verification_status);

create trigger set_prices_updated_at
  before update on public.prices
  for each row execute function public.set_updated_at();

create table public.price_history (
  id           uuid primary key default gen_random_uuid(),
  variant_id   uuid not null references public.product_variants (id) on delete cascade,
  retailer_id  uuid not null references public.retailers (id) on delete restrict,
  price        numeric(12, 2) not null check (price >= 0),
  mrp          numeric(12, 2) check (mrp >= 0),
  source_id    uuid references public.sources (id) on delete set null,
  recorded_at  timestamptz not null default now()
);

create index price_history_variant_id_idx on public.price_history (variant_id);
create index price_history_variant_recorded_idx on public.price_history (variant_id, recorded_at desc);
