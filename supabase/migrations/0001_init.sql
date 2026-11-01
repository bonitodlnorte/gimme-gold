-- Gimme Gold v2: initial schema.
-- Health data (GDPR art. 9): every table is private to its owner through RLS.
-- The partner view never reads tables directly; it goes through partner_view(), which
-- returns only what docs/definicion-funcional.md §3 allows (no notes, no history).

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  declared_cycle_length smallint check (declared_cycle_length between 21 and 45),
  contraception text not null default 'no' check (contraception in ('no', 'si', 'no_decir')),
  health_consent_at timestamptz not null,
  legacy_imported_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_date date not null,
  end_date date check (end_date is null or end_date >= start_date),
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  unique (user_id, start_date)
);

create index periods_user_start on public.periods (user_id, start_date desc);

create table public.partner_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Only the SHA-256 of the token is stored; the token itself lives in the shared link.
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '90 days',
  revoked_at timestamptz
);

create index partner_links_user on public.partner_links (user_id);

alter table public.profiles enable row level security;
alter table public.periods enable row level security;
alter table public.partner_links enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own periods" on public.periods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own partner links" on public.partner_links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- What the partner link may see: the current cycle start, the estimated cycle length
-- (median of the last 6 cycles between 21 and 45 days, as in src/domain/cycle.ts) and
-- whether phases are only orientative. The client computes the phase from these.
create or replace function public.partner_view(token text)
returns table (cycle_start date, cycle_length int, orientative boolean)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  owner uuid;
  starts date[];
  lengths int[];
  declared int;
  contra text;
  spread int;
begin
  select l.user_id into owner
  from partner_links l
  where l.token_hash = encode(digest(token, 'sha256'), 'hex')
    and l.revoked_at is null
    and l.expires_at > now();

  if owner is null then
    return;
  end if;

  select array_agg(p.start_date order by p.start_date desc) into starts
  from periods p where p.user_id = owner;

  select pr.declared_cycle_length, pr.contraception into declared, contra
  from profiles pr where pr.user_id = owner;

  if starts is null then
    return;
  end if;

  select array_agg(len order by i) into lengths
  from (
    select i, starts[i] - starts[i + 1] as len
    from generate_subscripts(starts, 1) as i
    where i < array_length(starts, 1)
  ) d
  where len between 21 and 45;

  lengths := lengths[1:6];
  spread := case when array_length(lengths, 1) >= 2
    then (select max(x) - min(x) from unnest(lengths) x) end;

  return query select
    starts[1],
    coalesce(
      (select round(percentile_cont(0.5) within group (order by x))::int from unnest(lengths) x),
      declared,
      28
    ),
    contra = 'si' or coalesce(spread > 7, false);
end;
$$;

revoke all on function public.partner_view(text) from public;
grant execute on function public.partner_view(text) to anon, authenticated;
