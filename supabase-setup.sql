-- JRVS Property Co. V0.2.1 Cloud Sync setup
-- Run this entire script in Supabase Dashboard > SQL Editor.
create table if not exists public.jrvs_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.jrvs_user_state enable row level security;
drop policy if exists "JRVS users can read own state" on public.jrvs_user_state;
create policy "JRVS users can read own state"
  on public.jrvs_user_state for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists "JRVS users can insert own state" on public.jrvs_user_state;
create policy "JRVS users can insert own state"
  on public.jrvs_user_state for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists "JRVS users can update own state" on public.jrvs_user_state;
create policy "JRVS users can update own state"
  on public.jrvs_user_state for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id,name,public,file_size_limit)
values ('jrvs-photos','jrvs-photos',false,52428800)
on conflict (id) do update set public=false, file_size_limit=52428800;

drop policy if exists "JRVS users can read own photos" on storage.objects;
create policy "JRVS users can read own photos"
on storage.objects for select to authenticated
using (bucket_id='jrvs-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "JRVS users can upload own photos" on storage.objects;
create policy "JRVS users can upload own photos"
on storage.objects for insert to authenticated
with check (bucket_id='jrvs-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "JRVS users can update own photos" on storage.objects;
create policy "JRVS users can update own photos"
on storage.objects for update to authenticated
using (bucket_id='jrvs-photos' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='jrvs-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "JRVS users can delete own photos" on storage.objects;
create policy "JRVS users can delete own photos"
on storage.objects for delete to authenticated
using (bucket_id='jrvs-photos' and (storage.foldername(name))[1]=auth.uid()::text);
