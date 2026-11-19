# LANDER RIO — OpenAI API / ROX AI staged integration

**State (2026-11-18):** Both Supabase functions deployed in STAGING; not integrated into the published site. No production changes, no automatic posts, no WhatsApp sends. **API credentials are not provisioned/confirmed. Paid model calls remain disabled.**

## 1. Deployed endpoints

- `lander-rox-ai-v2-staging` v4 (`VERSION=2.1.0-staging`): public staging endpoint with origin allow-list, Cloudflare Turnstile challenge, medical/commercial human routing, simple IP throttling, and durable credit reservation before model calls.
- `lander-content-studio-staging` v2 (`VERSION=1.1.0-staging`): JWT-protected internal editorial generator, internal-token authentication, input filtering, structured drafts, `store:false`, no public website CORS.

The ROX stage has `verify_jwt=false` **by design** to support the chat widget; it must not be published until anti-bot gating is tested. The Content Studio stage has `verify_jwt=true`.

## 2. Durable cost guard applied

- Existing Supabase project `artcokrtuqppgtawuczq` has table `public.lander_ai_budget_guard`, migration `lander_ai_staging_budget_guard_20261118`.
- Budget ceiling: **US$ 1.00 lifetime total, combined across ROX and Content Studio staging**. This is an application-side quota, not the OpenAI organization spending limit or current credit balance.
- Database function `public.lander_ai_reserve_staging(text,bigint)` performs an atomic reservation, using the privileged server role only. **No grant to `anon` or `authenticated`.** The table has RLS and no public policies.
- Conservative per-request reservation estimates: ROX Luna US$0.004, Terra US$0.025; Studio Luna US$0.006, Terra US$0.030, Sol US$0.065, Astra US$0.195. Reservations are intentionally not refunded, even if a model call fails: conservative fail-closed behavior.
- Both staging functions deny model requests if the quota database is unavailable; no credentials are returned to a browser.

## 3. Remaining user action (required)

Use the OpenAI Platform key creation widget and choose the linked **Personal** organization and the API project the user wishes to use. Never paste the raw key into chat, GitHub, client-side JS, or email.

The developer/owner must enter this secret directly in the Supabase project dashboard:

`https://supabase.com/dashboard/project/artcokrtuqppgtawuczq/functions/secrets`

| Secret name | Value / action |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API project key, created with the key setup flow |
| `ROX_AI_MODEL` | `gpt-6-luna` (recommended cost-efficient starter) |
| `ROX_TURNSTILE_SECRET` | Real Cloudflare Turnstile server secret for authorized production domain |
| `ROX_TURNSTILE_SITE_KEY` | Matching public site key, issued for authorized domain |
| `ROX_AI_ENABLED` | `true` **only after** access, billing, captcha, and HTTP tests |
| `ROX_AI_BUDGET_APPROVED` | `true` **only after** billing authorization and confirmed credit balance |
| `LANDER_STUDIO_MODEL` | `gpt-6.1-terra` for editorial drafts (or another model on allowlist) |
| `LANDER_STUDIO_INTERNAL_TOKEN` | Strong random 32+ byte secret, used only server to server |
| `LANDER_STUDIO_ENABLED` | `true` **only after** internal authentication tested |
| `LANDER_STUDIO_BUDGET_APPROVED` | `true` **only after** billing authorization and confirmed credit balance |

Supabase additionally injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Edge Functions using legacy keys; both are required for the quota guard. Do not set the `SUPABASE_` values manually in secrets, expose service keys, or use client-side service_role.

## 4. Accepted request types

ROX provides general educational conversation without real-time inventory, payment or order data. Commercial requests are handled by human staff; health/medication marketing is not automated. Content Studio generates private **drafts** for dynamic Reels, carousels, or articles and requires editorial approval before publishing.

Example JSON for private Content Studio route `/generate`:

```json
{ "format":"reel", "topic":"Treinar pesado ou treinar perto da falha?", "audience":"fitness", "source_facts":[] }
```

## 5. Testing and release checklist

1. Local TypeScript check: `tsc --noEmit --target ES2022 --lib ES2022,DOM --module ESNext --moduleResolution Bundler --skipLibCheck supabase/functions/lander-content-studio-staging/index.ts`
2. Local tests: `node --experimental-strip-types --test tests/studio.test.mjs`; 10/10 passing as of 2026-11-18.
3. Live deploy metadata verified: Studio v2 ACTIVE JWT=true, ROX v4 ACTIVE JWT=false. **Full live HTTP and OpenAI billing tests are not yet verified.**
4. Database role checks: RLS on, anon denied table SELECT and RPC EXECUTE, authenticated denied, service_role allowed; reserved_micro_usd=0 at end of this run.
5. After direct secret entry and billing confirmation: test `GET /health` and one low-cost model call per stage using authenticated server-side tools. Compare with Platform Usage, and halt on any unexpected charges or errors.
6. Publish ROX widget to production only after human review, CAPTCHA validation, UX test on mobile, and separate authorization; never assume staging implies production availability.

## 6. Compatibility and limits

- OpenAI model IDs and prices checked against current official API docs as of 2026-11-18: `gpt-6-luna`, `gpt-6.1-terra`, `gpt-6.2-sol`, and `gpt-6.2-astra`.
- The estimated quota is intentionally smaller than the US$100/month subscription benefit and cannot guarantee the entire OpenAI organization's bill stays below US$1; other projects and keys operate separately.
- No automatic video generation is enabled; Reels scripts are video-first, but actual video rendering requires an independent video capability and separate budget.