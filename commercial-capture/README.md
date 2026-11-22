# Commercial capture candidate — unpublished

The current production Varejo/Atacado pages open WhatsApp only. Tool-registration fallback is already in Supabase but has a different purpose. This candidate reuses the Supabase infrastructure, preserving existing `leads`, workout/nutrition tables, WhatsApp, triggers and automations. `schema-proposal.sql` is an unexecuted proposal for a dedicated commercial request queue; no hosted schema was changed.

## Contract

`POST /api/commercial/lead`, JSON `{request_id: UUID-v4, profile: "varejo"|"atacado", intent: "consulta"|"orcamento"|"envio"|"suporte", name?: string, email: string, origin: {entry_path,page_path,utm_source?,utm_medium?,utm_campaign?}, privacy_ack:true, website:""}`.

First submission returns 201, same request and content returns 200 with `duplicate:true`, changed content for same ID returns 409. Confirmation is issued only after the RPC transaction/SQLite transaction commits. Storage error/timeout returns 503. CRM is outside this transaction: accepted requests remain `pending`, so the browser does not claim CRM success. No scheduler, outbound messages, or CRM writes run on capture.

Netlify function reads `COMMERCIAL_SUPABASE_URL` and `COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY` from runtime environment, never browser code. Preview must point at an isolated database with the reviewed schema, not the production project. Without settings, it fails closed with 503. An isolated preview must set `COMMERCIAL_ALLOWED_ORIGIN` to its exact HTTPS origin (no path or trailing slash); if set, only that origin is accepted. Defaults accept only the two official production origins. Configure preview environment scopes separately and confirm the database URL/project identity and credentials belong to staging before opening the preview. Node 24 runtime supported; no external package dependencies.

## Local QA (synthetic data only)

`node commercial-capture/qa-server.mjs --site site --port 3100 --database /tmp/lander-commercial-qa.sqlite`

The harness binds only loopback. Database is durable SQLite with WAL/FULL synchronization. Production adapter is PostgREST RPC, not SQLite. CSP and explicit `/api/*` blocks prevent live integrations. `/__qa/requests` is a local synthetic operator view, never shipped as a production function. POST `/__qa/mode` with JSON `{"mode":"database_down"|"saved_timeout"|"delay"|"normal"}` tests failures. `saved_timeout` commits then delays the response for 15 seconds (the browser aborts at 12 seconds): retry uses the same UUID.

`node --test commercial-capture/*.test.mjs`

The PostgreSQL suite is opt-in: set `LR_CAPTURE_POSTGRES_CONTAINER` to the name of an **isolated local** PostgreSQL container with the proposed schema applied. It tests concurrent calls, unique storage, conflict rejection, role grants and operator claims against PostgreSQL, not an emulation.

## Team recovery

After staging/prod schema approval, an authorized operator uses the authenticated Supabase SQL Editor (no public team endpoint):

```sql
select receipt,created_at,profile,intent,origin,crm_status,crm_contact_id
from public.commercial_requests
where receipt = 'LR-<32_HEX_CHARACTERS>';
```

To contact the person, query `name,email` in this same protected interface. Access management for real team accounts remains to be approved; no anonymous read grants exist. CRM outage queue:

```sql
select receipt,created_at,profile,intent,origin,last_error
from public.commercial_requests where crm_status='pending' order by created_at;
```

When HubSpot capacity is restored, a specifically authorized operator can run `COMMERCIAL_CRM_SYNC_ENABLED=true node commercial-capture/operator.mjs reconcile-one --apply`, using server-only secrets supplied securely. Claims are atomic with a 60-second lease; CRM uses upsert by email. A lost CRM response can safely retry the same contact; request origin/intent stay immutable in Supabase. New custom CRM fields are not assumed. Outage leaves the row pending. No send, campaign, workflow or automation activation is part of reconciliation. Local tests use a fake CRM; no HubSpot contacts were created.

## Release gates

1. Reconcile candidate static files with current deployed assets; do not deploy repository history wholesale.
2. Approve/apply schema and service credentials to an isolated staging database; prove API/RPC over HTTP there.
3. Run the same mobile tests against that staging environment and verify the authenticated team account can read the saved record.
4. Obtain explicit production deployment/schema approval, then use a versioned Netlify deployment including the new function and server-only modules.
5. Verify live configuration without synthetic production submission unless specifically authorized. For a faulty published release, revert the candidate commit and publish the reviewed revert; keep durable request records intact.

## Reproduced backend evidence (22 November 2026)

PostgreSQL 17.12 and PostgREST 13.0.4 were run in disposable local Docker containers with **synthetic contacts only**. The proposed schema was applied there. Eight concurrent RPCs accepted the same request once; changed content conflicted; unauthorized roles could not read or invoke capture. Claims were mutually exclusive and reclaimable after expiry. The actual Netlify function was bundled with `@netlify/zip-it-and-ship-it@16.6.0` (`esbuild`), including both server-only imports and the configured routing/rate limits. Its compiled module then called authenticated local HTTP PostgREST: 201 initial save, 200 repeat, 409 conflict, one stored row, and 401 anonymous read. This validates the packaged code/SQL boundary, not the hosted Supabase gateway, deployed credentials, Netlify edge enforcement or live HubSpot.

The opt-in packaged HTTP suite uses `LR_CAPTURE_BUNDLE_PATH` (extracted bundled `commercial-lead.mjs`) and `LR_CAPTURE_POSTGREST_URL=http://127.0.0.1:<port>`. The local PostgREST fixture requires `PGRST_JWT_SECRET=lr-qa-only-jwt-secret-at-least-32-characters`, `PGRST_DB_ANON_ROLE=anon` and the schema/roles from the PostgreSQL suite. The JWT fixture is test-only and must never configure a hosted environment. Never publish the QA harness or its operator endpoints.

CRM mapping preserves `crm_contact_id` on each request; the authenticated SQL lookup remains the authority for that request's profile, intent and origin. A contact may make several distinct requests. Reconciliation updates only standard HubSpot email property, so it does not invent custom fields or overwrite the immutable request metadata. The submitted name remains in the request queue and never overwrites a curated CRM name. Team permission and the CRM contact bridge still require staging verification with the intended operator account.
