-- Lock term on each paid habit. Apply only on project wdyzzxrqphfmroxcskna.
-- Do not run this file on etshbvpvhgnifcejptay or any other project.

alter table public.habit_events add column if not exists pillar text;
alter table public.habit_events add column if not exists lock_months integer not null default 12;
alter table public.habit_events add column if not exists unlocks_at timestamptz;

update public.habit_events
set unlocks_at = occurred_at + make_interval(months => lock_months)
where unlocks_at is null;

create unique index if not exists habit_events_checkout_uidx
  on public.habit_events (checkout_request_id)
  where checkout_request_id is not null;
