-- Shree Collections 999 — run this once in Supabase: SQL Editor -> New query -> Run

-- 1. The sarees table
create table if not exists public.sarees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  description text,
  image_url text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sarees enable row level security;

-- Everyone can view the catalogue
create policy "Public can view sarees"
  on public.sarees for select using (true);

-- Only the logged-in owner can add / edit / delete
create policy "Owner can add sarees"
  on public.sarees for insert to authenticated with check (true);
create policy "Owner can edit sarees"
  on public.sarees for update to authenticated using (true) with check (true);
create policy "Owner can delete sarees"
  on public.sarees for delete to authenticated using (true);

-- 2. Photo storage (public bucket called "sarees")
insert into storage.buckets (id, name, public)
values ('sarees', 'sarees', true)
on conflict (id) do nothing;

create policy "Owner can upload saree photos"
  on storage.objects for insert to authenticated with check (bucket_id = 'sarees');
create policy "Owner can delete saree photos"
  on storage.objects for delete to authenticated using (bucket_id = 'sarees');
