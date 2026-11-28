-- Existing installations only. Keep the function owner, grants and queued requests.
begin;
do $$
begin
 if pg_catalog.to_regprocedure('public.capture_commercial_request(jsonb)') is null then
  raise exception 'commercial capture schema is not installed';
 end if;
end $$;
create or replace function public.capture_commercial_request(p_record jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare r public.commercial_requests; inserted boolean;
begin
 insert into public.commercial_requests(request_id,fingerprint,receipt,profile,intent,name,email,origin,privacy_ack)
 values((p_record->>'request_id')::uuid,p_record->>'fingerprint','LR-'||upper(replace(p_record->>'request_id','-','')),p_record->>'profile',p_record->>'intent',coalesce(p_record->>'name',''),p_record->>'email',p_record->'origin',(p_record->>'privacy_ack')::boolean)
 -- Concurrent retries can encounter either the request_id or receipt unique index.
 on conflict do nothing returning * into r;
 inserted := found;
 if not inserted then
  select * into strict r from public.commercial_requests where request_id=(p_record->>'request_id')::uuid for update;
  if r.fingerprint<>p_record->>'fingerprint' then raise exception 'idempotency_conflict'; end if;
 end if;
 return jsonb_build_object('saved',true,'receipt',r.receipt,'duplicate',not inserted,'crm_status',r.crm_status);
end $$;
commit;
