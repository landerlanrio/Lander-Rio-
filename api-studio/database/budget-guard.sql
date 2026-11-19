-- LANDER RIO — Reference copy of migration already applied to Supabase on 2026-11-18.
-- Do NOT re-run on the same project: the objects already exist.
-- No OpenAI credit is spent by running this migration.
create table public.lander_ai_budget_guard (
  scope text primary key check(scope='global-staging'),
  reserved_micro_usd bigint not null default 0 check(reserved_micro_usd between 0 and 1000000),
  reserved_requests bigint not null default 0 check(reserved_requests >= 0),
  updated_at timestamptz not null default now()
);
alter table public.lander_ai_budget_guard enable row level security;
revoke all on table public.lander_ai_budget_guard from public, anon, authenticated;
grant select, insert, update on table public.lander_ai_budget_guard to service_role;
insert into public.lander_ai_budget_guard(scope) values ('global-staging');

create function public.lander_ai_reserve_staging(p_service text, p_reserved_micro_usd bigint)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare accepted boolean := false;
begin
  if p_service not in ('rox-staging','content-studio-staging')
     or p_reserved_micro_usd is null or p_reserved_micro_usd < 1
     or p_reserved_micro_usd > 200000 then
    return false;
  end if;
  update public.lander_ai_budget_guard
  set reserved_micro_usd = reserved_micro_usd + p_reserved_micro_usd,
      reserved_requests = reserved_requests + 1,
      updated_at = clock_timestamp()
  where scope = 'global-staging'
    and reserved_micro_usd + p_reserved_micro_usd <= 1000000
  returning true into accepted;
  return coalesce(accepted,false);
end;
$$;
revoke all on function public.lander_ai_reserve_staging(text,bigint) from public,anon,authenticated;
grant execute on function public.lander_ai_reserve_staging(text,bigint) to service_role;