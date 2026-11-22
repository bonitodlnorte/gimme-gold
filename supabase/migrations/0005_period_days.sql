-- How many days her period usually lasts, set in Ajustes. Used for the calendar and the plan until
-- she logs period ends; from then on the app takes the median of those (src/domain/cycle.ts).
alter table public.profiles
  add column declared_period_days smallint check (declared_period_days between 2 and 10);
