create table public.comparisons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete cascade,
  share_token text not null unique default encode(gen_random_bytes(6), 'hex'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index comparisons_user_id_idx on public.comparisons (user_id);
create index comparisons_share_token_idx on public.comparisons (share_token);

create trigger set_comparisons_updated_at
  before update on public.comparisons
  for each row execute function public.set_updated_at();

create table public.comparison_items (
  id             uuid primary key default gen_random_uuid(),
  comparison_id  uuid not null references public.comparisons (id) on delete cascade,
  product_id     uuid not null references public.products (id) on delete cascade,
  position       smallint not null check (position between 1 and 4),
  created_at     timestamptz not null default now(),
  unique (comparison_id, position),
  unique (comparison_id, product_id)
);

create index comparison_items_comparison_id_idx on public.comparison_items (comparison_id);

create table public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table public.wishlist_items (
  id            uuid primary key default gen_random_uuid(),
  wishlist_id   uuid not null references public.wishlists (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create index wishlist_items_wishlist_id_idx on public.wishlist_items (wishlist_id);
