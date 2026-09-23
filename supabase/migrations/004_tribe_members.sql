-- People who saved a profile and sat in a tribe.
-- The harvest pill reads this list. Sample faces are not stored here.
-- Apply only on project wdyzzxrqphfmroxcskna
-- (https://wdyzzxrqphfmroxcskna.supabase.co).
-- Safe to re-run there. Do not apply this file to any other project,
-- including etshbvpvhgnifcejptay.

create table if not exists public.tribe_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  handle text not null,
  name text not null,
  photo text not null,
  updated_at timestamptz not null default now(),
  unique (slug, handle)
);

create index if not exists tribe_members_slug_updated_idx
  on public.tribe_members (slug, updated_at desc);

alter table public.tribe_members enable row level security;
