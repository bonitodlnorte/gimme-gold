-- partner_subscribe() failed on every real link: its parameters were named like the columns
-- (endpoint, auth, last_key) and `on conflict (endpoint)` is an expression context, so plpgsql
-- found the name ambiguous. Both partner RPCs take p_-prefixed parameters now; the client
-- (src/data/store.ts) passes them by these names.

drop function if exists public.partner_subscribe(text, text, text, text, text);
drop function if exists public.partner_unsubscribe(text, text);

create or replace function public.partner_subscribe(p_token text, p_endpoint text, p_p256dh text, p_auth text, p_last_key text)
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
  where l.token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and l.revoked_at is null
    and l.expires_at > now();

  if link is null then
    return false;
  end if;

  insert into push_subscriptions (partner_link_id, endpoint, p256dh, auth, last_key)
  values (link, p_endpoint, p_p256dh, p_auth, p_last_key)
  on conflict (endpoint) do update
    set partner_link_id = excluded.partner_link_id,
        user_id = null,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        last_key = excluded.last_key;
  return true;
end;
$$;

create or replace function public.partner_unsubscribe(p_token text, p_endpoint text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from push_subscriptions s
  using partner_links l
  where s.partner_link_id = l.id
    and s.endpoint = p_endpoint
    and l.token_hash = encode(digest(p_token, 'sha256'), 'hex');
end;
$$;

revoke all on function public.partner_subscribe(text, text, text, text, text) from public;
revoke all on function public.partner_unsubscribe(text, text) from public;
grant execute on function public.partner_subscribe(text, text, text, text, text) to anon, authenticated;
grant execute on function public.partner_unsubscribe(text, text) to anon, authenticated;
