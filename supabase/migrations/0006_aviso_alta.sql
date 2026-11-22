-- A mail to the owner each time someone finishes signing up. A row lands in public.profiles when she accepts
-- the health consent, and this trigger then calls api/alta.ts, which sends the mail. The call carries no data
-- about her: the function counts the profiles itself.
--
-- Where to call and with what secret live in Supabase Vault, not here, so nothing secret is in the repo.
-- Create both once in the SQL Editor (the secret is the same value as ALTA_SECRET in Vercel):
--
--   select vault.create_secret('https://<the app's domain>/api/alta', 'alta_webhook_url');
--   select vault.create_secret('<ALTA_SECRET>', 'alta_webhook_secret');
--
-- Until both exist the trigger does nothing. Whatever goes wrong here is swallowed: a failed notification
-- must never stop a sign-up. pg_net queues the request and sends it after the insert commits.

create extension if not exists pg_net;

create or replace function public.avisar_alta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  destino text;
  secreto text;
begin
  select decrypted_secret into destino from vault.decrypted_secrets where name = 'alta_webhook_url';
  select decrypted_secret into secreto from vault.decrypted_secrets where name = 'alta_webhook_secret';

  if destino is not null and secreto is not null then
    perform net.http_post(
      url := destino,
      body := '{}'::jsonb,
      headers := jsonb_build_object('content-type', 'application/json', 'authorization', 'Bearer ' || secreto)
    );
  end if;
  return null;
exception when others then
  return null;
end;
$$;

revoke all on function public.avisar_alta() from public;

create trigger avisar_alta
  after insert on public.profiles
  for each row execute function public.avisar_alta();
