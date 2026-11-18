/**
 * LANDER RIO — Content Studio (staging only) v1.0.0
 * Private server-to-server editorial drafts. No commercial, clinical or automatic publishing.
 * FAIL CLOSED: deploy alone cannot consume credits.
 */
declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Promise<Response>): void };

type Format = 'reel' | 'carousel' | 'article';
type Audience = 'fitness' | 'revendedores' | 'geral';
type Input = { format: Format; topic: string; audience: Audience; source_facts: string[] };

const VERSION = '1.0.0-staging';
const MAX_BODY_BYTES = 8500;
const MAX_OUTPUT_TOKENS = 1800;
const TIMEOUT_MS = 25000;
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-6-luna': { input: 0.10, output: 0.50 },
  'gpt-6.1-terra': { input: 1.00, output: 5.00 },
  'gpt-6.2-sol': { input: 2.00, output: 10.00 },
  'gpt-6.2-astra': { input: 8.00, output: 40.00 },
};
const NON_MEDICAL = /\b(?:tirzepatid[ae]?|retatrutid[ae]?|semaglutid[ae]?|hgh|esteroid(?:es)?|anabolizant(?:e|es)|trembolona|nandrolona|oxandrolona|peptid(?:eo|eos)|bpc[ -]?157|tb[ -]?500|ghk[ -]?cu|horm[oô]nios?|testosterona|medicamentos? controlados?|canetas? emagrecedoras?)\b/i;
const PRIVATE_DATA = /[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{3}\.\d{3}\.\d{3}-?\d{2}\b|(?:\+?55\s?)?\(?\d{2}\)?\s?9\d{4}[-\s]?\d{4}/i;
const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
};
const env = (key: string) => { try { return Deno.env.get(key)?.trim() ?? ''; } catch { return ''; } };
const json = (status: number, result: Record<string, unknown>) => new Response(JSON.stringify(result), { status, headers });

export function isSafeEditorialTopic(text: string): boolean {
  return text.length > 0 && !NON_MEDICAL.test(text) && !PRIVATE_DATA.test(text);
}

export function validateInput(value: unknown): { ok: true; value: Input } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid_body' };
  const v = value as Record<string, unknown>;
  if (!['reel', 'carousel', 'article'].includes(String(v.format))) return { ok: false, error: 'invalid_format' };
  if (typeof v.topic !== 'string' || v.topic.trim().length < 8 || v.topic.length > 220) return { ok: false, error: 'invalid_topic' };
  if (!isSafeEditorialTopic(v.topic)) return { ok: false, error: 'restricted_or_private_topic' };
  const audience = v.audience ?? 'fitness';
  if (!['fitness', 'revendedores', 'geral'].includes(String(audience))) return { ok: false, error: 'invalid_audience' };
  const facts = v.source_facts ?? [];
  if (!Array.isArray(facts) || facts.length > 6 || facts.some(x => typeof x !== 'string' || x.length > 360 || !isSafeEditorialTopic(x))) {
    return { ok: false, error: 'invalid_source_facts' };
  }
  return { ok: true, value: { format: v.format as Format, topic: v.topic.trim(), audience: audience as Audience, source_facts: facts as string[] } };
}

export function selectedModel(): string | null {
  const model = env('LANDER_STUDIO_MODEL');
  return Object.hasOwn(MODEL_PRICING, model) ? model : null;
}

export function enabled(): boolean {
  return env('LANDER_STUDIO_ENABLED') === 'true'
    && env('LANDER_STUDIO_BUDGET_APPROVED') === 'true'
    && !!env('OPENAI_API_KEY') && !!env('LANDER_STUDIO_INTERNAL_TOKEN')
    && !!selectedModel();
}

export function tokenMatches(given: string, expected: string): boolean {
  if (!given || !expected || given.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < given.length; i++) mismatch |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return mismatch === 0;
}

export function estimatedCostUsd(model: string, inputTokens: number, outputTokens: number): number | null {
  const price = MODEL_PRICING[model];
  if (!price || !Number.isFinite(inputTokens) || !Number.isFinite(outputTokens)) return null;
  return Number(((inputTokens * price.input + outputTokens * price.output) / 1_000_000).toFixed(6));
}

function instructions(input: Input): string {
  return [
    'Você é o editor criativo da LANDER RIO — PERFORMANCE CULTURE, marca do Rio de Janeiro.',
    'Produza um RASCUNHO original de qualidade editorial premium em português brasileiro, com linguagem natural e direta.',
    'Público: praticantes de musculação e cultura de academia; não faça marketing médico nem venda de produtos clínicos.',
    'Se for Reel: roteiro filmável em vídeo real, tomadas dinâmicas, 9:16, movimento de câmera, som e cortes; NUNCA slideshow de imagens estáticas.',
    'Se for carrossel: narrativa com páginas claras e avanço intelectual; se for artigo: gancho, estrutura e resumo explicativo.',
    'Não prometa viralização, ganho muscular certo, emagrecimento garantido, aprovação clínica ou resultados mensuráveis não comprovados.',
    'Não invente estudos, estatísticas, fontes, preços, disponibilidade, parcerias oficiais nem depoimentos.',
    'Se uma afirmação científica depender de evidência que não está fornecida, coloque-a em claims_to_verify.',
    'Não prescreva doses, tratamentos, medicamentos nem ofereça venda de substâncias sujeitas a prescrição ou sem autorização.',
    'Não adicione informações pessoais nem links não fornecidos. Todo resultado exige revisão editorial humana antes de publicar.',
    `Formato: ${input.format}. Público: ${input.audience}. Dado de contexto confiável apenas se informado explicitamente em source_facts.`,
  ].join('\n');
}

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    hook: { type: 'string' },
    script: { type: 'string' },
    shots: { type: 'array', items: { type: 'object', properties: {
      duration_seconds: { type: 'integer' }, visual_prompt: { type: 'string' },
      on_screen_text: { type: 'string' }, narration: { type: 'string' },
    }, required: ['duration_seconds', 'visual_prompt', 'on_screen_text', 'narration'], additionalProperties: false } },
    caption: { type: 'string' },
    cta: { type: 'string' },
    hashtags: { type: 'array', items: { type: 'string' } },
    claims_to_verify: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'hook', 'script', 'shots', 'caption', 'cta', 'hashtags', 'claims_to_verify'],
  additionalProperties: false,
} as const;

function parsedOutput(raw: unknown): unknown | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  let text = typeof data.output_text === 'string' ? data.output_text : '';
  if (!text && Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item && item.type === 'message' && Array.isArray(item.content)) {
        text += item.content.filter((v: {type?: string}) => v.type === 'output_text').map((v: {text?: string}) => v.text ?? '').join('');
      }
    }
  }
  try {
    const o = JSON.parse(text);
    if (typeof o?.title !== 'string' || typeof o?.hook !== 'string' || !Array.isArray(o?.shots)
      || typeof o?.caption !== 'string' || !Array.isArray(o?.claims_to_verify)) return null;
    return o;
  } catch { return null; }
}

export async function handler(req: Request): Promise<Response> {
  const pathname = new URL(req.url).pathname;
  if (req.method === 'GET' && pathname.endsWith('/health')) {
    return json(200, { service: 'LANDER Content Studio', version: VERSION, environment: 'staging', ready: enabled(), paid_calls_allowed: enabled(), human_review_required: true });
  }
  if (req.method !== 'POST' || !pathname.endsWith('/generate')) return json(405, { error: 'method_not_allowed' });
  // All staging traffic also requires a valid Supabase JWT, enforced at the gateway (verify_jwt=true).
  if (!enabled()) return json(503, { error: 'disabled_or_unconfigured', message: 'No API credits can be spent before explicit budget and credential enablement.' });
  if (!tokenMatches(req.headers.get('x-lander-internal-token') ?? '', env('LANDER_STUDIO_INTERNAL_TOKEN'))) return json(403, { error: 'unauthorized' });
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return json(415, { error: 'json_required' });
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return json(413, { error: 'request_too_large' });
  let body: unknown;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { error: 'request_too_large' });
    body = JSON.parse(raw);
  } catch { return json(400, { error: 'invalid_json' }); }
  const valid = validateInput(body);
  if ('error' in valid) return json(422, { error: valid.error });
  const model = selectedModel();
  if (!model) return json(503, { error: 'model_not_configured' });
  const userInput = JSON.stringify(valid.value);
  const payload = {
    model,
    instructions: instructions(valid.value),
    input: [{ role: 'user', content: userInput }],
    reasoning: { effort: model === 'gpt-6.2-astra' || model === 'gpt-6.2-sol' ? 'low' : 'none' },
    max_output_tokens: MAX_OUTPUT_TOKENS,
    store: false,
    text: { format: { type: 'json_schema', name: 'lander_editorial_draft', strict: true, schema: SCHEMA } },
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${env('OPENAI_API_KEY')}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal,
    });
    if (!response.ok) return json(502, { error: 'model_unavailable', provider_status: response.status });
    const data = await response.json();
    const draft = parsedOutput(data);
    if (!draft) return json(502, { error: 'incomplete_or_unexpected_model_output' });
    const inputTokens = Number(data?.usage?.input_tokens ?? 0);
    const outputTokens = Number(data?.usage?.output_tokens ?? 0);
    return json(200, {
      draft, model, stage: 'editorial_review_required', published: false,
      usage: { input_tokens: inputTokens, output_tokens: outputTokens, estimated_standard_model_cost_usd: estimatedCostUsd(model, inputTokens, outputTokens) },
    });
  } catch { return json(502, { error: 'provider_timeout_or_network' }); }
  finally { clearTimeout(timer); }
}

Deno.serve(handler);