-- ============================================================
-- Seed / demo data — FOR DEVELOPMENT ONLY
-- ============================================================
-- Every fact below is explicitly tagged verification_status = 'unverified'
-- and tied to a 'GadGexo Demo Seed' source record — nothing here should
-- ever be mistaken for agent-verified or admin-verified market data.
-- Fixed UUIDs make this file idempotent (safe to re-run).

insert into public.sources (id, name, domain, source_type, reliability_priority, is_active) values
  ('90000000-0000-0000-0000-000000000001', 'GadGexo Demo Seed', null, 'other', 0, true)
on conflict (id) do nothing;

insert into public.brands (id, name, slug, country) values
  ('a0000000-0000-0000-0000-000000000001', 'Apple',    'apple',    'USA'),
  ('a0000000-0000-0000-0000-000000000002', 'Samsung',  'samsung',  'South Korea'),
  ('a0000000-0000-0000-0000-000000000003', 'OnePlus',  'oneplus',  'China'),
  ('a0000000-0000-0000-0000-000000000004', 'Google',   'google',   'USA'),
  ('a0000000-0000-0000-0000-000000000005', 'Xiaomi',   'xiaomi',   'China'),
  ('a0000000-0000-0000-0000-000000000006', 'Nothing',  'nothing',  'UK'),
  ('a0000000-0000-0000-0000-000000000007', 'Motorola', 'motorola', 'USA')
on conflict (slug) do nothing;

insert into public.categories (id, name, slug, parent_id) values
  ('b0000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', null)
on conflict (slug) do nothing;

insert into public.categories (id, name, slug, parent_id) values
  ('b0000000-0000-0000-0000-000000000002', 'Smartphones',  'smartphones',  'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'Tablets',      'tablets',      'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'Laptops',      'laptops',      'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000005', 'Smartwatches', 'smartwatches', 'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000006', 'Earbuds',      'earbuds',      'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000007', 'Headphones',   'headphones',   'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000008', 'Cameras',      'cameras',      'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000009', 'Gaming',       'gaming',       'b0000000-0000-0000-0000-000000000001')
on conflict (slug) do nothing;

insert into public.specification_groups (id, name, slug, sort_order) values
  ('c0000000-0000-0000-0000-000000000001', 'Network',      'network',      1),
  ('c0000000-0000-0000-0000-000000000002', 'Body',         'body',         2),
  ('c0000000-0000-0000-0000-000000000003', 'Display',      'display',      3),
  ('c0000000-0000-0000-0000-000000000004', 'Platform',     'platform',     4),
  ('c0000000-0000-0000-0000-000000000005', 'Memory',       'memory',       5),
  ('c0000000-0000-0000-0000-000000000006', 'Main Camera',  'main-camera',  6),
  ('c0000000-0000-0000-0000-000000000007', 'Battery',      'battery',      7),
  ('c0000000-0000-0000-0000-000000000008', 'Software',     'software',     8),
  ('c0000000-0000-0000-0000-000000000009', 'Connectivity', 'connectivity', 9),
  ('c0000000-0000-0000-0000-00000000000a', 'Sound',        'sound',        10),
  ('c0000000-0000-0000-0000-00000000000b', 'Features',     'features',     11)
on conflict (slug) do nothing;

insert into public.specifications (id, group_id, name, slug, unit, data_type, sort_order) values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Display Size', 'display-size', 'in', 'number', 1),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'Panel Type',   'panel-type',   null, 'text',   2),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Refresh Rate', 'refresh-rate', 'Hz', 'number', 4),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 'Chipset',      'chipset',      null, 'text',   1),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000005', 'RAM',          'ram',          'GB', 'number', 1),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005', 'Storage',      'storage',      'GB', 'number', 2),
  ('d0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-000000000006', 'Main Camera',  'main-camera',  'MP', 'text',   1),
  ('d0000000-0000-0000-0000-00000000000d', 'c0000000-0000-0000-0000-000000000007', 'Battery Capacity', 'battery-capacity', 'mAh', 'number', 1),
  ('d0000000-0000-0000-0000-00000000000f', 'c0000000-0000-0000-0000-000000000008', 'Operating System', 'operating-system', null, 'text', 1),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', '5G', '5g', null, 'boolean', 1)
on conflict (group_id, slug) do nothing;

insert into public.retailers (id, name, slug, website_url, country) values
  ('h0000000-0000-0000-0000-000000000001', 'Amazon India',     'amazon-india',     'https://www.amazon.in',        'India'),
  ('h0000000-0000-0000-0000-000000000002', 'Flipkart',         'flipkart',         'https://www.flipkart.com',     'India'),
  ('h0000000-0000-0000-0000-000000000003', 'Croma',            'croma',            'https://www.croma.com',        'India'),
  ('h0000000-0000-0000-0000-000000000004', 'Reliance Digital', 'reliance-digital', 'https://www.reliancedigital.in', 'India')
on conflict (slug) do nothing;

insert into public.products (
  id, brand_id, category_id, name, slug, short_description, description,
  announcement_date, release_date, india_release_date, status,
  verification_status, is_featured, is_trending
) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
   'iPhone 17 Pro', 'iphone-17-pro',
   '[Demo data] Apple flagship — seed record for development, not verified market data.',
   '[Demo data] Placeholder description for exercising the schema and UI.',
   '2026-09-09', '2026-09-19', '2026-09-19', 'published', 'unverified', true, true),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
   'Galaxy S26 Ultra', 'galaxy-s26-ultra',
   '[Demo data] Samsung flagship — seed record for development, not verified market data.',
   '[Demo data] Placeholder description for exercising the schema and UI.',
   '2026-01-22', '2026-02-07', '2026-02-07', 'published', 'unverified', true, false),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
   'OnePlus 13', 'oneplus-13',
   '[Demo data] OnePlus flagship — seed record for development, not verified market data.',
   '[Demo data] Placeholder description for exercising the schema and UI.',
   '2025-10-24', '2025-11-13', '2025-12-05', 'published', 'unverified', false, true)
on conflict (slug) do nothing;

insert into public.product_variants (id, product_id, ram, storage, storage_type, color, color_hex, region, availability) values
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '12GB', '256GB', 'NVMe',    'Deep Blue',       '#1B2A4A', 'India', 'in_stock'),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', '12GB', '256GB', 'UFS 4.0', 'Titanium Black',  '#1C1C1E', 'India', 'in_stock'),
  ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', '16GB', '256GB', 'UFS 4.0', 'Midnight Ocean',  '#0D1B2A', 'India', 'in_stock')
on conflict do nothing;

-- Every value below explicitly stamped 'unverified' + the demo source —
-- never left to silently default without a source reference.
insert into public.product_specifications (product_id, specification_id, value, numeric_value, boolean_value, source_id, verification_status) values
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '6.3', 6.3, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'OLED', null, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', '120', 120, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'Apple A19 Pro', null, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-00000000000d', '4200', 4200, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-00000000000f', 'iOS 20', null, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000010', 'true', null, true, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', '6.9', 6.9, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000005', 'Snapdragon 8 Elite Gen 2', null, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-00000000000d', '5000', 5000, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', '6.82', 6.82, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', 'Snapdragon 8 Elite', null, null, '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-00000000000d', '6000', 6000, null, '90000000-0000-0000-0000-000000000001', 'unverified')
on conflict (product_id, specification_id) do nothing;

insert into public.product_images (product_id, image_url, alt_text, image_type, sort_order, is_primary, source_id) values
  ('e0000000-0000-0000-0000-000000000001', 'https://placehold.co/800x800?text=iPhone+17+Pro', 'iPhone 17 Pro (placeholder)', 'primary', 1, true, '90000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'https://placehold.co/800x800?text=Galaxy+S26+Ultra', 'Galaxy S26 Ultra (placeholder)', 'primary', 1, true, '90000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'https://placehold.co/800x800?text=OnePlus+13', 'OnePlus 13 (placeholder)', 'primary', 1, true, '90000000-0000-0000-0000-000000000001')
on conflict (product_id, image_url) do nothing;

insert into public.prices (variant_id, retailer_id, price, mrp, product_url, availability, source_id, verification_status) values
  ('f0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 134900, 139900, 'https://www.amazon.in/dp/DEMO-IP17P-256', 'in_stock', '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('f0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000001', 129999, 134999, 'https://www.amazon.in/dp/DEMO-S26U-256', 'in_stock', '90000000-0000-0000-0000-000000000001', 'unverified'),
  ('f0000000-0000-0000-0000-000000000005', 'h0000000-0000-0000-0000-000000000002', 69999, 74999, 'https://www.flipkart.com/p/DEMO-OP13-256', 'in_stock', '90000000-0000-0000-0000-000000000001', 'unverified')
on conflict (variant_id, retailer_id) do nothing;

insert into public.price_history (variant_id, retailer_id, price, mrp, source_id, recorded_at) values
  ('f0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 139900, 139900, '90000000-0000-0000-0000-000000000001', now() - interval '60 days'),
  ('f0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', 134900, 139900, '90000000-0000-0000-0000-000000000001', now() - interval '2 days'),
  ('f0000000-0000-0000-0000-000000000005', 'h0000000-0000-0000-0000-000000000002', 74999, 74999, '90000000-0000-0000-0000-000000000001', now() - interval '90 days'),
  ('f0000000-0000-0000-0000-000000000005', 'h0000000-0000-0000-0000-000000000002', 69999, 74999, '90000000-0000-0000-0000-000000000001', now() - interval '3 days')
on conflict do nothing;
