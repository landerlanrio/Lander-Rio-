-- REVIEW ONLY. DO NOT APPLY TO PRODUCTION. New isolated private schema.
-- Requires explicit migration approval and verification of actual Supabase grants.
create schema if not exists revenue_intelligence;
revoke all on schema revenue_intelligence from public, anon, authenticated;
create table if not exists revenue_intelligence.opportunities (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^LR-[0-9A-F-]{36}$'),
  segment text not null check (segment in ('atacado','varejo','geral')),
  source text not null check (source in ('instagram','whatsapp','google','facebook','tiktok','direct','referral','unknown')),
  placement text not null default 'unknown',
  stage text not null default 'prepared' check (stage in ('prepared','clicked','conversation_confirmed','qualified','proposal','won','lost')),
  consent_recorded_at timestamptz not null,
  hubspot_contact_id text,
  hubspot_deal_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists revenue_intelligence.opportunity_events (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references revenue_intelligence.opportunities(id),
  external_event_id text not null unique,
  event_type text not null check (event_type in ('handoff_prepared','whatsapp_open_click','conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost')),
  evidence_source text,
  evidence_id_hash text,
  amount_brl numeric(14,2) check (amount_brl >= 0),
  occurred_at timestamptz not null default now(),
  check (event_type not in ('conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost') or (evidence_source is not null and evidence_id_hash is not null)),
  check (event_type <> 'sale_confirmed' or amount_brl is not null)
);
create index if not exists opportunity_events_lookup on revenue_intelligence.opportunity_events(opportunity_id,occurred_at desc);
alter table revenue_intelligence.opportunities enable row level security;
alter table revenue_intelligence.opportunity_events enable row level security;
-- No anon/authenticated policies. Backend access must be authorized separately.
-- Never expose service_role keys in the browser. No CRM or production writes here.
