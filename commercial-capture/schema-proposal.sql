-- PROPOSAL ONLY. Apply first to an isolated staging database after review.
-- Dedicated request queue: no changes to legacy leads, workflows, or outbound triggers.
begin;
create table if not exists public.commercial_requests (
 request_id uuid primary key,
 fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
 receipt text not null unique,
 profile text not null check(profile in ('varejo','atacado')),
 intent text not null check(intent in ('consulta','orcamento','envio','suporte')),
 name text not null default '' check(length(name)<=80),
 email text not null check(length(email)<=254 and email like '%@%.%'),
 origin jsonb not null,
 privacy_ack boolean not null check(privacy_ack),
 created_at timestamptz not null default now(),
 crm_status text not null default 'pending' check(crm_status in ('pending','synced')),
 crm_contact_id text,
 claim_token uuid,
 claim_until timestamptz,
 last_error text
);
alter table public.commercial_requests enable row level security;
revoke all on public.commercial_requests from public,anon,authenticated;
-- Supabase may grant ALL to service_role through default privileges. Reset explicitly.
revoke all on public.commercial_requests from service_role;
grant select,insert,update on public.commercial_requests to service_role;
create index if not exists commercial_requests_pending on public.commercial_requests(created_at) where crm_status='pending';
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
create or replace function public.claim_commercial_request() returns jsonb
language plpgsql security invoker set search_path='' as $$
declare r public.commercial_requests;
begin
 update public.commercial_requests set claim_token=gen_random_uuid(),claim_until=now()+interval '60 seconds'
 where request_id=(select request_id from public.commercial_requests where crm_status='pending' and (claim_until is null or claim_until<now()) order by created_at for update skip locked limit 1)
 returning * into r;
 if not found then return null; end if;
 return to_jsonb(r);
end $$;
create or replace function public.finish_commercial_request(p_request_id uuid,p_token uuid,p_contact_id text) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 update public.commercial_requests set crm_status='synced',crm_contact_id=p_contact_id,claim_token=null,claim_until=null,last_error=null
 where request_id=p_request_id and claim_token=p_token;
 return found;
end $$;
create or replace function public.release_commercial_request(p_request_id uuid,p_token uuid) returns void
language sql security invoker set search_path='' as $$
 update public.commercial_requests set claim_token=null,claim_until=null,last_error='crm_unavailable' where request_id=p_request_id and claim_token=p_token;
$$;
revoke all on function public.capture_commercial_request(jsonb),public.claim_commercial_request(),public.finish_commercial_request(uuid,uuid,text),public.release_commercial_request(uuid,uuid) from public,anon,authenticated;
grant execute on function public.capture_commercial_request(jsonb),public.claim_commercial_request(),public.finish_commercial_request(uuid,uuid,text),public.release_commercial_request(uuid,uuid) to service_role;
commit;
