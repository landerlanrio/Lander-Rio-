# Commercial capture candidate — unpublished

The current production Varejo/Atacado pages open WhatsApp only. Tool-registration fallback is already in Supabase but has a different purpose. This candidate reuses the Supabase infrastructure, preserving existing `leads`, workout/nutrition tables, WhatsApp, triggers and automations. `schema-proposal.sql` is an unexecuted proposal for a dedicated commercial request queue; no hosted schema was changed.

## Contract

`POST /api/commercial/lead`, JSON `{request_id: UUID-v4, profile: "varejo"|"atacado", intent: "consulta"|"orcamento"|"envio"|"suporte", name?: string, email: string, origin: {entry_path,page_path,utm_source?,utm_medium?,utm_campaign?}, privacy_ack:true, website:""}`.

First submission returns 201, same request and content returns 200 with `duplicate:true`, changed content for same ID returns 409. Confirmation is issued only after the RPC transaction/SQLite transaction commits. Storage error/timeout returns 503. CRM is outside this transaction: accepted requests remain `pending`, so the browser does not claim CRM success. No scheduler, outbound messages, or CRM writes run on capture.

The direct-RPC compiled-function fixture reads `COMMERCIAL_SUPABASE_URL` and `COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY` only with explicit `COMMERCIAL_DIRECT_FIXTURE=true`, fixed synthetic URLs and `https://isolated.example.test` Origin. It cannot target either real project. Hosted capture uses the reviewed Edge bridge below, with server-only gateway credentials. Without settings, it fails closed with 503. An isolated preview must set `COMMERCIAL_ALLOWED_ORIGIN` to its exact HTTPS origin (no path or trailing slash); if set, only that origin is accepted. Defaults accept only the two official production origins. Configure preview environment scopes separately and confirm the database URL/project identity and credentials belong to staging before opening the preview. Node 24 runtime supported; no external package dependencies.

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

PostgreSQL 17.12 and PostgREST 13.0.4 were run in disposable local Docker containers with **synthetic contacts only**. The proposed schema was applied there. Eight concurrent RPCs accepted the same request once; changed content conflicted; unauthorized roles could not read or invoke capture. Claims were mutually exclusive and reclaimable after expiry. The actual Netlify function was bundled with `@netlify/zip-it-and-ship-it@16.6.0` (`nft`, conforme manifesto de empacotamento), including both server-only imports and the configured routing/rate limits. Its compiled module then called authenticated local HTTP PostgREST: 201 initial save, 200 repeat, 409 conflict, one stored row, and 401 anonymous read. This validates the packaged code/SQL boundary, not the hosted Supabase gateway, deployed credentials, Netlify edge enforcement or live HubSpot.

The opt-in packaged HTTP suite uses `LR_CAPTURE_BUNDLE_PATH` (extracted bundled `commercial-lead.mjs`) and `LR_CAPTURE_POSTGREST_URL=http://127.0.0.1:<port>`. The local PostgREST fixture requires `PGRST_JWT_SECRET=lr-qa-only-jwt-secret-at-least-32-characters`, `PGRST_DB_ANON_ROLE=anon` and the schema/roles from the PostgreSQL suite. The JWT fixture is test-only and must never configure a hosted environment. Never publish the QA harness or its operator endpoints.

CRM mapping preserves `crm_contact_id` on each request; the authenticated SQL lookup remains the authority for that request's profile, intent and origin. A contact may make several distinct requests. Reconciliation updates only standard HubSpot email property, so it does not invent custom fields or overwrite the immutable request metadata. The submitted name remains in the request queue and never overwrites a curated CRM name. Team permission and the CRM contact bridge still require staging verification with the intended operator account.

## Reproducible browser acceptance

With the isolated fixture already listening on loopback, install `playwright@1.58.2` and its Chromium in a temporary tool directory, then run `node commercial-capture/browser-qa.cjs` with that directory available through `NODE_PATH`. The CI workflow provides this setup. Browser installation downloads only the test runner/browser; it does not create a hosted preview or use live service credentials.

The suite accepts `LR_QA_BASE_URL` (default `http://127.0.0.1:3100`) and `LR_QA_OUTPUT` (default `/tmp/lander-browser-qa`). Base URL validation rejects non-loopback hosts, credentials, paths and queries. Set `LR_QA_CHROMIUM_EXECUTABLE=/usr/bin/chromium` only when using a preinstalled local Chromium instead of Playwright's downloaded browser. Set `LR_QA_EXPECT_BACKEND=packaged_postgrest` for the compiled handler/PostgREST rehearsal; the suite checks `/__qa/health` and records the backend identity and PID before any form submission. The fixture must expose `/__qa/mode` and `/__qa/requests` with synthetic data only; these operator endpoints must never be deployed.

Thirteen acceptance cases cover both profiles at 360/390/1440 px, two rapid click attempts, a committed request whose reply times out, unavailable storage and retry, reload with changed content (409) followed by recovery of the original receipt, one consented saved event without contact fields, and one profile-selection event for each Hero CTA. Assertions query persisted rows, check exact origin/profile/intent, and require the interface to withhold success until persistence is confirmed. Every external browser request is aborted and fails the suite. Screenshots and incremental `browser-results.json` contain fictitious contacts only. A failed assertion exits nonzero and saves `failure.png` when a page remains available. These checks can run against SQLite or the packaged function/PostgREST fixture; the report must identify which fixture actually ran. Passing locally or in ephemeral CI does not prove a hosted Supabase deployment, team login, CRM capacity or analytics dashboard receipt.
## Ephemeral remote homologation

`remote-fixture.mjs` prepares the same test boundary on a standard GitHub-hosted runner, with no Supabase project, Netlify publication, outbound workflow or customer data. It creates uniquely named disposable Docker resources, applies the schema only there, compiles the actual Netlify function and starts the loopback QA site backed by that compiled function and authenticated HTTP PostgREST/PostgreSQL. The browser journey and backend checks therefore share real persistent PostgreSQL storage in this mode.

Commands are `start --out <temporary-directory> --site site --tools <pinned-QA-tooling-directory>`, `test --out <same-directory>` and `stop --out <same-directory>`. `--qa-port` overrides 3100 when testing alongside another local server. The tooling directory must contain the locked `@netlify/zip-it-and-ship-it@16.6.0` installation. CI handles dependency installation separately. `start` writes only local paths/container names/loopback URLs to its state/env files and, when present, appends the test variables to `$GITHUB_ENV`. It checks `/__qa/health` for the exact spawned PID and `backend: packaged_postgrest`, so an unrelated service cannot satisfy readiness.

Upload only the curated `evidence.json`, `tests.tap` and browser review outputs. Do not upload fixture state, env files, container logs, database files or JWT fixtures. `stop` must run even when validation fails. PostgreSQL and PostgREST images are pinned by digest. Neither database exposes a public internet port; HTTP and the QA site bind loopback only.

The localhost bridge verifies the browser Origin then passes a fixed synthetic HTTPS Origin to the compiled Netlify handler. The real handler's exact-origin guard is independently tested. Browser `database_down` injects a transport error at the compiled RPC adapter while the operator read remains online; it does not stop PostgreSQL. `saved_timeout` commits to PostgreSQL then delays the response for 15 seconds. These simulations are identified in the evidence, along with the untested hosted Netlify/Supabase boundary.

## Hosted staging browser acceptance

`hosted-browser-qa.cjs` is a separate runner. The loopback runner remains restricted to loopback. The hosted runner hardcodes the reserved QA Netlify origin/site and the separate Supabase staging project, allows only the first-party commercial capture POST, generates only `@example.test` contacts, and blocks every other browser origin/write endpoint. It does not accept production domains or service credentials.

Complete a local copy of `hosted-target.example.json` only after the operator confirms the deployed Netlify ID, source commit, exact Edge Function upstream, database isolation and outbound settings. The example is deliberately unready and cannot submit. Run with `LR_HOSTED_QA_TARGET_FILE=/path/to/confirmed-target.json` and optional `LR_HOSTED_QA_OUTPUT=/tmp/lander-hosted-qa`; browser selection uses the same optional `LR_QA_CHROMIUM_EXECUTABLE` as the isolated suite. In environments that require the configured network proxy, set `LR_QA_USE_ENV_PROXY=1`; the runner uses the existing HTTPS_PROXY/HTTP_PROXY binding without recording its value or changing target allowlists. No hosted form is submitted before this target confirmation.

Before opening the QA homepage, the hosted suite reads `/api/commercial/health` and requires the exact staging project, ready storage and disabled CRM sync/outbound sends. It checks `noindex` on QA pages and `no-store` on health/capture responses. The hosted suite performs six normal journeys (both profiles at360/390/1440) and one identical API retry. It does not expose fixture failure modes on a hosted service. JSON/captures record frontend receipts and expected unique request IDs. It also generates `operator-verification.sql` for a separate authenticated lookup in the exact staging project. The runner explicitly leaves database verification pending: frontend success or HTTP201 alone does not establish durable storage. CRM recovery, rate limits, team access and analytics panel receipt require their own evidence. No WhatsApp message, campaign, CRM sync or production deployment is part of this runner.
## Hosted isolated QA adapter

The staging-only Supabase function source is `supabase/functions/commercial-capture-hml/index.ts`, uploaded with `staging-edge.mjs`, `core.mjs` and `supabase-store.mjs` beside it. `build-edge-payload.mjs` prepares the deployment request, including `verify_jwt: true`, with source/public IDs only. Do not deploy this function to production: it explicitly accepts only automatic runtime URL `https://riplqdzgwlggvhbznovm.supabase.co`, the exact QA Origin `https://lander-rio-commercial-hml-20261122.netlify.app`, and fictitious `@example.test` email addresses. Service-role credentials remain inside the Supabase function runtime; they are never exported to Netlify or the browser.

The additional staging-only SQL `staging-rate-proposal.sql` gives the function a durable 10-per-IP-bucket/minute and 120-global/minute limiter, restricted to service_role. Raw IP is not stored; the bucket is an HMAC, and old buckets expire. Gateway/proxy IP headers are quota signals rather than authenticated human identity. The global bucket also limits requests when those headers vary.

On the new isolated Netlify QA project, configure Functions-scoped variables `COMMERCIAL_EDGE_ENDPOINT=https://riplqdzgwlggvhbznovm.supabase.co/functions/v1/commercial-capture-hml`, `COMMERCIAL_EDGE_ANON_KEY` (enabled legacy anon JWT transferred securely) and `COMMERCIAL_ALLOWED_ORIGIN=https://lander-rio-commercial-hml-20261122.netlify.app`. The anon JWT remains server-only in Netlify. It invokes the JWT-protected Edge gateway but grants no direct read/write access to the request table. Do not configure direct RPC URL/service-role variables at the same time: the handler deliberately rejects ambiguous backends. No production environment is changed by adding this staging adapter.

The same `/api/commercial/lead` Netlify function selects this explicit bridge mode, validates Origin and payload size, forwards only reviewed headers, and returns a successful receipt only when the Edge/storage acknowledgment passes validation. It will not proxy an arbitrary URL or another Supabase project. `/api/commercial/health` calls the Edge `/health` probe and reports only the isolated project identity, empty table-read readiness, disabled CRM/outbound flags and version. API responses force noindex/nofollow/noarchive and no-store. The isolated static package must independently force noindex, block all other `/api/*` routes and prevent production analytics/service connections.

The owner can locate a synthetic receipt through an authenticated project SQL query. This proves administrator retrieval; it does not establish additional team-account access or CRM synchronization. A human team account must be tested through its normal login before expanding permissions. No shared public operator secret or anonymous contact-list endpoint is introduced.


## Production candidate (apply only after hosted QA)

`production-edge.mjs` is a separately guarded wrapper around the same capture core/store. It accepts only automatic runtime project URL `https://artcokrtuqppgtawuczq.supabase.co` and the two official Origins `https://landerrio.com.br` / `https://www.landerrio.com.br`; it accepts ordinary email addresses. `build-production-edge-payload.mjs` prepares source for function `commercial-capture-entry` with gateway JWT verification enabled, without deploying or reading/exporting any service-role key. The runtime key stays inside Supabase.

Apply the reviewed commercial request schema and `production-rate-proposal.sql` only after inspecting the production schema for collisions and passing hosted QA. Both are additive and use dedicated commercial tables/functions, with no foreign key, trigger or write to existing leads, tool registrations, WhatsApp, AI or workflows. The secondary Edge quota is 30 per observed gateway IP/minute and 120 globally/minute; Netlify's configured limit is 10 per client IP/minute. The proxy IP is a quota signal and may be shared.

Production Netlify configuration must explicitly set `COMMERCIAL_EDGE_ENVIRONMENT=production`, `COMMERCIAL_EDGE_ENDPOINT=https://artcokrtuqppgtawuczq.supabase.co/functions/v1/commercial-capture-entry`, its enabled legacy anon JWT in server-only `COMMERCIAL_EDGE_ANON_KEY`, and `COMMERCIAL_ALLOWED_ORIGIN=https://landerrio.com.br`. Without the explicit environment, the production endpoint is rejected. QA and production endpoint/origin combinations cannot be mixed. Do not set the direct-fixture variables on a hosted project.

The health response validates the actual upstream version and project identity before returning it; stale/missing versions fail closed. API responses remain noindex/no-store. Production static pages must retain their intended indexability and existing legacy API redirects; do not promote the QA noindex/catchall-block package. The deployable production functions directory contains the two reviewed commercial functions, without the generated QA block function.

No CRM sync or outbound action is activated. Requests remain pending and recoverable by the authorized owner through the dedicated table. On a faulty published release, deploy a reviewed revert package as a new version while preserving accepted request rows and receipts; never drop the queue to reverse a frontend release.
