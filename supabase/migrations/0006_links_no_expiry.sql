-- Partner links no longer expire on their own: she revokes them, or creates a new one, which
-- revokes the previous. 'infinity' keeps every `expires_at > now()` check (partner_view,
-- partner_subscribe, the notifications cron) working unchanged. Existing links stop expiring too.
alter table public.partner_links alter column expires_at set default 'infinity';
update public.partner_links set expires_at = 'infinity' where revoked_at is null;
