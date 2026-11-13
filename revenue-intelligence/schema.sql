-- REVIEW ONLY. DO NOT APPLY TO PRODUCTION. The connected Supabase project has real data.
-- Private, unexposed schema; migration requires a separate authorized sandbox and SQL/RLS testing.
create schema if not exists revenue_intelligence;
revoke all on schema revenue_intelligence from public, anon, authenticated;

create table if not exists revenue_intelligence.opportunities (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^LR-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$'),
  segment text not null check (segment in ('atacado','varejo','geral')),
  source text not null check (source in ('instagram','whatsapp','google','facebook','tiktok','direct','referral','unknown')),
  placement text not null default 'unknown',
  stage text not null default 'prepared' check (stage in ('prepared','clicked','conversation_confirmed','qualified','proposal','won','lost')),
  consent_recorded_at timestamptz not null,
  consent_version text not null,
  hubspot_contact_id text,
  hubspot_deal_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists revenue_intelligence.opportunity_events (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references revenue_intelligence.opportunities(id),
  external_event_id text not null unique check (char_length(external_event_id) between 1 and 128),
  idempotency_key text not null unique check (idempotency_key ~ '^[A-Za-z0-9_-]{12,96}$'),
  event_type text not null check (event_type in ('handoff_prepared','whatsapp_open_click','conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost')),
  event_origin text not null check (event_origin in ('visitor','verified_backend')),
  evidence_source text,
  evidence_id_hash text,
  amount_brl numeric(14,2),
  occurred_at timestamptz not null default now(),
  check (
    (event_type in ('conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost')
      and event_origin = 'verified_backend'
      and evidence_source is not null and nullif(btrim(evidence_source),'') is not null
      and evidence_id_hash is not null and evidence_id_hash ~ '^[0-9a-f]{64}$')
    or
    (event_type not in ('conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost')
      and evidence_source is null and evidence_id_hash is null)
  ),
  check (
    (event_type = 'sale_confirmed' and amount_brl is not null and amount_brl > 0)
    or (event_type <> 'sale_confirmed' and amount_brl is null)
  )
);

create index if not exists opportunity_events_lookup
  on revenue_intelligence.opportunity_events(opportunity_id,occurred_at desc);

alter table revenue_intelligence.opportunities enable row level security;
alter table revenue_intelligence.opportunity_events enable row level security;
revoke all on all tables in schema revenue_intelligence from public, anon, authenticated;
revoke all on all sequences in schema revenue_intelligence from public, anon, authenticated;
-- No anon/authenticated grants or policies. No service role key in browser.
-- Server must enforce consent provenance, transitions, authentication and atomic writes.
-- Merely creating tables does not implement a secure public endpoint. DO NOT RUN against production.
