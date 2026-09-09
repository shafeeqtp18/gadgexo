-- ============================================================
-- Row Level Security
-- ============================================================
-- Ground rules:
--   * Public reads published catalog data only. Never writes anything.
--   * editor/moderator/admin ("staff") manage catalog content.
--   * Provenance/automation internals (sources, agent_runs, agent_actions,
--     review_queue, data_conflicts, automation_settings) are NEVER public
--     — staff-readable, and only admins can touch automation_settings
--     (the actual ON/OFF switch) or delete agent history.
--   * The admin panel / future agent use lib/supabase/admin.ts
--     (service_role), which bypasses RLS entirely — everything below
--     governs the anon/authenticated clients only.

-- ---------- profiles ----------
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update
  using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
create policy "profiles_insert_admin_only" on public.profiles for insert
  with check (public.is_admin());

create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change a profile role';
  end if;
  return new;
end;
$$;

create trigger prevent_profiles_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ---------- catalog reference data: public read, staff write ----------
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.specification_groups enable row level security;
alter table public.specifications enable row level security;
alter table public.retailers enable row level security;

create policy "brands_select_all" on public.brands for select using (true);
create policy "brands_write_staff" on public.brands for insert with check (public.is_staff());
create policy "brands_update_staff" on public.brands for update using (public.is_staff()) with check (public.is_staff());
create policy "brands_delete_admin" on public.brands for delete using (public.is_admin());

create policy "categories_select_all" on public.categories for select using (true);
create policy "categories_write_staff" on public.categories for insert with check (public.is_staff());
create policy "categories_update_staff" on public.categories for update using (public.is_staff()) with check (public.is_staff());
create policy "categories_delete_admin" on public.categories for delete using (public.is_admin());

create policy "spec_groups_select_all" on public.specification_groups for select using (true);
create policy "spec_groups_write_staff" on public.specification_groups for insert with check (public.is_staff());
create policy "spec_groups_update_staff" on public.specification_groups for update using (public.is_staff()) with check (public.is_staff());
create policy "spec_groups_delete_admin" on public.specification_groups for delete using (public.is_admin());

create policy "specifications_select_all" on public.specifications for select using (true);
create policy "specifications_write_staff" on public.specifications for insert with check (public.is_staff());
create policy "specifications_update_staff" on public.specifications for update using (public.is_staff()) with check (public.is_staff());
create policy "specifications_delete_admin" on public.specifications for delete using (public.is_admin());

create policy "retailers_select_all" on public.retailers for select using (true);
create policy "retailers_write_staff" on public.retailers for insert with check (public.is_staff());
create policy "retailers_update_staff" on public.retailers for update using (public.is_staff()) with check (public.is_staff());
create policy "retailers_delete_admin" on public.retailers for delete using (public.is_admin());

-- ---------- products: published-only public read, staff manage all statuses ----------
alter table public.products enable row level security;

create policy "products_select_published_or_staff" on public.products for select
  using (status = 'published' or public.is_staff());
create policy "products_write_staff" on public.products for insert with check (public.is_staff());
create policy "products_update_staff" on public.products for update using (public.is_staff()) with check (public.is_staff());
create policy "products_delete_admin" on public.products for delete using (public.is_admin());

-- ---------- variants / specs / images / prices: visible via published parent ----------
alter table public.product_variants enable row level security;
alter table public.product_specifications enable row level security;
alter table public.product_images enable row level security;
alter table public.prices enable row level security;
alter table public.price_history enable row level security;

create policy "variants_select_via_published_product" on public.product_variants for select
  using (public.is_staff() or exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "variants_write_staff" on public.product_variants for insert with check (public.is_staff());
create policy "variants_update_staff" on public.product_variants for update using (public.is_staff()) with check (public.is_staff());
create policy "variants_delete_staff" on public.product_variants for delete using (public.is_staff());

create policy "product_specs_select_via_published_product" on public.product_specifications for select
  using (public.is_staff() or exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "product_specs_write_staff" on public.product_specifications for insert with check (public.is_staff());
create policy "product_specs_update_staff" on public.product_specifications for update using (public.is_staff()) with check (public.is_staff());
create policy "product_specs_delete_staff" on public.product_specifications for delete using (public.is_staff());

create policy "product_images_select_via_published_product" on public.product_images for select
  using (public.is_staff() or exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "product_images_write_staff" on public.product_images for insert with check (public.is_staff());
create policy "product_images_update_staff" on public.product_images for update using (public.is_staff()) with check (public.is_staff());
create policy "product_images_delete_staff" on public.product_images for delete using (public.is_staff());

create policy "prices_select_via_published_product" on public.prices for select
  using (public.is_staff() or exists (
    select 1 from public.product_variants v join public.products p on p.id = v.product_id
    where v.id = variant_id and p.status = 'published'));
create policy "prices_write_staff" on public.prices for insert with check (public.is_staff());
create policy "prices_update_staff" on public.prices for update using (public.is_staff()) with check (public.is_staff());
create policy "prices_delete_staff" on public.prices for delete using (public.is_staff());

create policy "price_history_select_via_published_product" on public.price_history for select
  using (public.is_staff() or exists (
    select 1 from public.product_variants v join public.products p on p.id = v.product_id
    where v.id = variant_id and p.status = 'published'));
create policy "price_history_write_staff" on public.price_history for insert with check (public.is_staff());
-- No update/delete policy: history is append-only by design.

-- ---------- comparisons / wishlists: unchanged from Phase 1 design ----------
alter table public.comparisons enable row level security;
alter table public.comparison_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;

create policy "comparisons_select_all" on public.comparisons for select using (true);
create policy "comparisons_insert_own_or_anonymous" on public.comparisons for insert
  with check (user_id is null or user_id = auth.uid());
create policy "comparisons_update_own" on public.comparisons for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comparisons_delete_own" on public.comparisons for delete using (auth.uid() = user_id);

create policy "comparison_items_select_all" on public.comparison_items for select using (true);
create policy "comparison_items_insert_via_comparison" on public.comparison_items for insert
  with check (exists (select 1 from public.comparisons c where c.id = comparison_id and (c.user_id = auth.uid() or c.user_id is null)));
create policy "comparison_items_delete_via_comparison" on public.comparison_items for delete
  using (exists (select 1 from public.comparisons c where c.id = comparison_id and (c.user_id = auth.uid() or c.user_id is null)));

create policy "wishlists_owner_all" on public.wishlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist_items_owner_all" on public.wishlist_items for all
  using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));

-- ---------- admin_logs: immutable, admin-read-only ----------
alter table public.admin_logs enable row level security;

create policy "admin_logs_select_admin_only" on public.admin_logs for select using (public.is_admin());
create policy "admin_logs_insert_staff" on public.admin_logs for insert with check (public.is_staff());

-- ---------- provenance & automation internals: never public ----------
alter table public.sources enable row level security;
alter table public.source_observations enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_actions enable row level security;
alter table public.review_queue enable row level security;
alter table public.data_conflicts enable row level security;
alter table public.automation_settings enable row level security;

create policy "sources_select_staff" on public.sources for select using (public.is_staff());
create policy "sources_write_staff" on public.sources for insert with check (public.is_staff());
create policy "sources_update_staff" on public.sources for update using (public.is_staff()) with check (public.is_staff());
create policy "sources_delete_admin" on public.sources for delete using (public.is_admin());

create policy "source_observations_select_staff" on public.source_observations for select using (public.is_staff());
create policy "source_observations_write_staff" on public.source_observations for insert with check (public.is_staff());

create policy "agent_runs_select_staff" on public.agent_runs for select using (public.is_staff());
create policy "agent_runs_write_admin" on public.agent_runs for insert with check (public.is_admin());
create policy "agent_runs_update_admin" on public.agent_runs for update using (public.is_admin()) with check (public.is_admin());

create policy "agent_actions_select_staff" on public.agent_actions for select using (public.is_staff());
create policy "agent_actions_write_admin" on public.agent_actions for insert with check (public.is_admin());
-- Staff (not just admin) can approve/reject — that IS the review job.
create policy "agent_actions_update_staff" on public.agent_actions for update
  using (public.is_staff()) with check (public.is_staff());

create policy "review_queue_select_staff" on public.review_queue for select using (public.is_staff());
create policy "review_queue_write_admin" on public.review_queue for insert with check (public.is_admin());
create policy "review_queue_update_staff" on public.review_queue for update
  using (public.is_staff()) with check (public.is_staff());

create policy "data_conflicts_select_staff" on public.data_conflicts for select using (public.is_staff());
create policy "data_conflicts_write_admin" on public.data_conflicts for insert with check (public.is_admin());
create policy "data_conflicts_update_staff" on public.data_conflicts for update
  using (public.is_staff()) with check (public.is_staff());

-- The actual automation ON/OFF switch — admin-only in every direction,
-- no exceptions. This is deliberately stricter than other staff tables.
create policy "automation_settings_select_staff" on public.automation_settings for select using (public.is_staff());
create policy "automation_settings_write_admin" on public.automation_settings for insert with check (public.is_admin());
create policy "automation_settings_update_admin" on public.automation_settings for update
  using (public.is_admin()) with check (public.is_admin());
create policy "automation_settings_delete_admin" on public.automation_settings for delete using (public.is_admin());
