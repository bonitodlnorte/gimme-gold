-- Right to erasure (GDPR art. 17): she can delete her account and all her data from Ajustes.
-- The client cannot delete from auth.users, so this runs with owner rights and only ever
-- deletes the caller. Profiles, periods and partner links go with it (on delete cascade).

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
