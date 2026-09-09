create table public.admin_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles (id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  old_data     jsonb,
  new_data     jsonb,
  created_at   timestamptz not null default now()
);

create index admin_logs_user_id_idx on public.admin_logs (user_id);
create index admin_logs_entity_idx on public.admin_logs (entity_type, entity_id);
create index admin_logs_created_at_idx on public.admin_logs (created_at desc);
