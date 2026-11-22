-- ISOLATED STAGING ONLY: project riplqdzgwlggvhbznovm. Never apply to production.
begin;
create table if not exists public.commercial_staging_rate_limits (
 bucket text primary key check(bucket='global' or bucket ~ '^[a-f0-9]{64}$'),
 window_started timestamptz not null,
 requests integer not null check(requests>0)
);
alter table public.commercial_staging_rate_limits enable row level security;
revoke all on public.commercial_staging_rate_limits from public,anon,authenticated;
grant select,insert,update,delete on public.commercial_staging_rate_limits to service_role;
create index if not exists commercial_staging_rate_window on public.commercial_staging_rate_limits(window_started);
create or replace function public.allow_commercial_staging_request(p_key text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare w timestamptz:=date_trunc('minute',statement_timestamp());g integer;c integer;retry integer:=greatest(1,60-extract(second from statement_timestamp())::integer);
begin
 if p_key is null or p_key !~ '^[a-f0-9]{64}$' then raise exception 'invalid_rate_key'; end if;
 delete from public.commercial_staging_rate_limits where window_started<w-interval '2 minutes';
 insert into public.commercial_staging_rate_limits(bucket,window_started,requests) values('global',w,1)
 on conflict(bucket) do update set window_started=excluded.window_started,requests=case when public.commercial_staging_rate_limits.window_started=excluded.window_started then public.commercial_staging_rate_limits.requests+1 else 1 end
 returning requests into g;
 if g>120 then return jsonb_build_object('allowed',false,'retry_after',retry); end if;
 insert into public.commercial_staging_rate_limits(bucket,window_started,requests) values(p_key,w,1)
 on conflict(bucket) do update set window_started=excluded.window_started,requests=case when public.commercial_staging_rate_limits.window_started=excluded.window_started then public.commercial_staging_rate_limits.requests+1 else 1 end
 returning requests into c;
 return jsonb_build_object('allowed',c<=10,'retry_after',retry);
end $$;
revoke all on function public.allow_commercial_staging_request(text) from public,anon,authenticated;
grant execute on function public.allow_commercial_staging_request(text) to service_role;
commit;
