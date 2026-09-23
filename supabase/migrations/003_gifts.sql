-- A Vuna Gift is credited to the person who was chosen, never to the sender's lock.
-- Apply only on project wdyzzxrqphfmroxcskna
-- (https://wdyzzxrqphfmroxcskna.supabase.co).
-- Safe to re-run there. Do not apply this file to any other project,
-- including etshbvpvhgnifcejptay.

alter table public.profiles add column if not exists handle text;

create unique index if not exists profiles_handle_uidx
  on public.profiles (lower(handle))
  where handle is not null;

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  recipient_handle text not null,
  recipient_profile_id uuid references public.profiles (id) on delete set null,
  sender_profile_id uuid references public.profiles (id) on delete set null,
  amount_kes integer not null check (amount_kes >= 1),
  checkout_request_id text,
  mpesa_receipt text,
  status text not null default 'success',
  occurred_at timestamptz not null default now()
);

create unique index if not exists gifts_checkout_uidx
  on public.gifts (checkout_request_id)
  where checkout_request_id is not null;

create index if not exists gifts_recipient_idx
  on public.gifts (lower(recipient_handle), occurred_at desc);

alter table public.gifts enable row level security;
