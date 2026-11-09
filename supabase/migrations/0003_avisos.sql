-- Push notifications (avisos). A subscription belongs either to her (user_id) or to a partner link
-- (partner_link_id): the partner has no account, so his rows are reached through RPCs by token, as
-- partner_view() does. `last_key` is the last state notified (src/domain/avisos.ts); the daily cron in
-- api/avisos.ts sends only when today's key differs, so nothing is repeated and nothing catches up.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  partner_link_id uuid references public.partner_links (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  last_key text,
  created_at timestamptz not null default now(),
  check ((user_id is null) <> (partner_link_id is null))
);

create index push_subscriptions_user on public.push_subscriptions (user_id);
create index push_subscriptions_link on public.push_subscriptions (partner_link_id);

alter table public.push_subscriptions enable row level security;

-- She manages her own devices directly. Partner rows have no user_id, so no client policy reaches them.
create policy "own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The partner subscribes his device against a valid link. Returns false when the link is unknown,
-- revoked or expired.
create or replace function public.partner_subscribe(token text, endpoint text, p256dh text, auth text, last_key text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  link uuid;
begin
  select l.id into link
  from partner_links l
  where l.token_hash = encode(digest(token, 'sha256'), 'hex')
    and l.revoked_at is null
    and l.expires_at > now();

  if link is null then
    return false;
  end if;

  insert into push_subscriptions as s (partner_link_id, endpoint, p256dh, auth, last_key)
  values (link, partner_subscribe.endpoint, partner_subscribe.p256dh, partner_subscribe.auth, partner_subscribe.last_key)
  on conflict (endpoint) do update
    set partner_link_id = excluded.partner_link_id,
        user_id = null,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        last_key = excluded.last_key;
  return true;
end;
$$;

-- The partner turns his device's notifications off. Only his own endpoint, only on his link.
create or replace function public.partner_unsubscribe(token text, endpoint text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from push_subscriptions s
  using partner_links l
  where s.partner_link_id = l.id
    and s.endpoint = partner_unsubscribe.endpoint
    and l.token_hash = encode(digest(token, 'sha256'), 'hex');
end;
$$;

revoke all on function public.partner_subscribe(text, text, text, text, text) from public;
revoke all on function public.partner_unsubscribe(text, text) from public;
grant execute on function public.partner_subscribe(text, text, text, text, text) to anon, authenticated;
grant execute on function public.partner_unsubscribe(text, text) to anon, authenticated;
