-- CMA sandbox: Profile identity for Friday 18:00 WhatsApp wrap.
-- Applied on project wdyzzxrqphfmroxcskna
-- (https://wdyzzxrqphfmroxcskna.supabase.co).
-- Safe to re-run there. Do not apply this file to any other project,
-- including etshbvpvhgnifcejptay.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  phone_number varchar(12),
  friday_wrap_enabled boolean not null default true,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_phone_msisdn check (
    phone_number is null or phone_number ~ '^2547[0-9]{8}$'
  )
);

alter table public.profiles add column if not exists phone_number varchar(12);
alter table public.profiles add column if not exists friday_wrap_enabled boolean not null default true;
alter table public.profiles add column if not exists display_name text;

create unique index if not exists profiles_phone_number_uidx
  on public.profiles (phone_number)
  where phone_number is not null;

create table if not exists public.habit_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete cascade,
  habit_id text not null,
  amount_kes integer not null,
  checkout_request_id text,
  mpesa_receipt text,
  status text not null default 'success',
  occurred_at timestamptz not null default now()
);

create index if not exists habit_events_profile_occurred_idx
  on public.habit_events (profile_id, occurred_at desc);

alter table public.profiles enable row level security;
alter table public.habit_events enable row level security;
