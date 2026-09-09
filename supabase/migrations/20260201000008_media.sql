create type public.product_image_type as enum ('primary', 'gallery', 'thumbnail', 'official', 'color_variant');

create table public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  variant_id   uuid references public.product_variants (id) on delete cascade,
  -- Either a Supabase Storage path (public bucket, see README) or an
  -- external URL captured by the future agent. Never binary data here.
  image_url    text not null,
  source_id    uuid references public.sources (id) on delete set null,
  alt_text     text,
  image_type   public.product_image_type not null default 'gallery',
  sort_order   integer not null default 0,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);
create index product_images_variant_id_idx on public.product_images (variant_id);
create unique index product_images_one_primary_per_product_idx
  on public.product_images (product_id) where is_primary;
create unique index product_images_product_url_unique_idx
  on public.product_images (product_id, image_url);
