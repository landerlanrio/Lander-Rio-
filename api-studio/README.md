# LANDER RIO — OpenAI API Content Studio (STAGING)

**Status:** code and staging backend only. This module does **not** publish content, send messages, sell products, or automatically spend API credits.

## Purpose

Generate structured, reviewable Portuguese editorial drafts for LANDER RIO: dynamic video-first Instagram Reels, carousels, and educational articles. Designed as a separate module from ROX AI 2.0, with no CRM read access and no personal data processing.

## Dependencies and setup

Runtime: Supabase Edge Functions / Deno. Upstream: OpenAI Responses API.

Required secrets (add through Supabase server-side secrets, **never** in site JS, GitHub or browser):

- `OPENAI_API_KEY`: OpenAI key with minimal needed permissions and account monitoring.
- `LANDER_STUDIO_INTERNAL_TOKEN`: long random server-to-server token.
- `LANDER_STUDIO_MODEL`: one of `gpt-6-luna`, `gpt-6.1-terra`, `gpt-6.2-sol` (editorial default recommendation), `gpt-6.2-astra`.
- `LANDER_STUDIO_ENABLED=true`: explicit feature switch.
- `LANDER_STUDIO_BUDGET_APPROVED=true`: explicit spending approval switch.

Without **all five** conditions, API calls return 503 and never contact OpenAI. In addition, deploy with `verify_jwt=true`, so a valid Supabase JWT is required at the gateway; also require the internal token.

## Routes

- `GET /health` — status only, protected by JWT at gateway.
- `POST /generate` — internal-only; `Content-Type: application/json` plus `x-lander-internal-token`.

Example private request body:

```json
{
  "format": "reel",
  "topic": "A diferença entre força e hipertrofia em uma mesma sessão",
  "audience": "fitness",
  "source_facts": []
}
```

Strict structured output: title, hook, script, video shots including voiceover, caption, CTA, hashtags, and scientific claims requiring verification.

## Safety and operational boundaries

- Never insert an OpenAI secret into a public webpage, URL, or chat transcript.
- No production website deployment is performed by deploying this module.
- Does not operate WhatsApp, charge customers, or perform health/medical sales.
- Rejects requests with common personal data patterns and specific high-risk medical marketing topics. This is a defense-in-depth filter, not a comprehensive compliance review.
- Uses `store:false`, disables public CORS, limits body and output size, and returns no unreviewed content to public visitors.
- Usage estimates reflect only listed model token rates; they are not equivalent to the current OpenAI billing ledger or a global monthly cost cap.
- There is **no durable request/budget accounting** in this version. Do **not** authorize spending until a durable per-project quota, billing alerts, access review, and actual API credits have been confirmed.
- Do not auto-enable OpenAI integration or publish medical claims.

## Verification checklist

1. Run TypeScript check.
2. Run automated tests with API disabled; verify zero provider calls.
3. Deploy staging function with `verify_jwt=true` and confirm it is ACTIVE by reading the deployed function metadata.
4. Verify an unauthenticated HTTP request returns a gateway error (not a generated draft).
5. Only after explicit approval and credential installation, run one low-cost test request, record actual tokens and compare estimated cost with account usage.
6. Connect server-side admin tooling and editorial approval flow to the content creator; not to public website.

## Suggested usage model mix

- `gpt-6-luna`: labeling and routine short summaries, when permitted.
- `gpt-6.2-sol`: Reel scripts, carousels, longer articles and nuance.
- `gpt-6.2-astra`: infrequent advanced strategy, research designs, coding and review. 
- Video generation (Sora) is **separate** from this module, subject to eligibility, access and per-second costs; no automatic renders.