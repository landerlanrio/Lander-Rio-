import test from 'node:test';
import assert from 'node:assert/strict';
let upstreamCalls = 0;
let exposedHandler;
let settings = new Map();
globalThis.Deno = {
  env: { get(name) { return settings.get(name); } },
  serve(fn) { exposedHandler = fn; },
};
globalThis.fetch = async () => { upstreamCalls++; throw new Error('Unexpected paid provider call'); };
const module = await import('../supabase/functions/lander-content-studio-staging/index.ts');
const { validateInput, isSafeEditorialTopic, selectedModel, enabled, tokenMatches, estimatedCostUsd } = module;
const safe = { format: 'reel', topic: 'Biomecânica para hipertrofia dos ombros', audience: 'fitness', source_facts: [] };

test('input parser accepts safe, structured drafts', () => {
  assert.equal(validateInput(safe).ok, true);
  assert.equal(validateInput({ ...safe, format: 'other' }).ok, false);
  assert.equal(validateInput({ ...safe, source_facts: Array(7).fill('abc') }).ok, false);
});
test('rejects private contact info and restricted drug marketing topics', () => {
  assert.equal(isSafeEditorialTopic('Venda de tirzepatida 15mg'), false);
  assert.equal(isSafeEditorialTopic('fale com x@y.com'), false);
  assert.equal(isSafeEditorialTopic('Melhorar a execução do agachamento'), true);
});
test('gate defaults to disabled and missing model rejected', () => {
  assert.equal(selectedModel(), null);
  assert.equal(enabled(), false);
});
test('gate stays disabled until all settings exist', () => {
  settings = new Map([['LANDER_STUDIO_ENABLED','true'],['OPENAI_API_KEY','fake'],['LANDER_STUDIO_INTERNAL_TOKEN','dev-secret'],['LANDER_STUDIO_MODEL','gpt-6.2-sol']]);
  assert.equal(enabled(), false);
  settings.set('LANDER_STUDIO_BUDGET_APPROVED','true');
  assert.equal(enabled(), true);
  settings.set('LANDER_STUDIO_MODEL','made-up');
  assert.equal(enabled(), false);
  settings.clear();
});
test('internal secret matching', () => {
  assert.equal(tokenMatches('abc','abc'), true);
  assert.equal(tokenMatches('abc','abd'), false);
  assert.equal(tokenMatches('',''), false);
});
test('token cost calculation is arithmetically correct', () => {
  assert.equal(estimatedCostUsd('gpt-6.2-sol',1000,500),0.007);
  assert.equal(estimatedCostUsd('invalid',1000,500),null);
});
test('POST with default-disabled gates never calls paid provider', async () => {
  settings.clear();
  const req = new Request('https://example.test/functions/v1/lander-content-studio-staging/generate', { method: 'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(safe) });
  const r = await exposedHandler(req);
  assert.equal(r.status,503);
  assert.equal(upstreamCalls,0);
});
test('health reflects disabled state without exposing secrets', async () => {
  settings.clear();
  const res = await exposedHandler(new Request('https://example.test/functions/v1/lander-content-studio-staging/health'));
  const body = await res.json();
  assert.equal(body.ready,false);
  assert.equal(body.paid_calls_allowed,false);
  assert.equal(JSON.stringify(body).includes('fake'),false);
});


test('enabled gate rejects unauthorized internal token before provider call', async () => {
  settings = new Map([['LANDER_STUDIO_ENABLED','true'],['LANDER_STUDIO_BUDGET_APPROVED','true'], ['OPENAI_API_KEY','test-not-real'],['LANDER_STUDIO_INTERNAL_TOKEN','test-secret'],['LANDER_STUDIO_MODEL','gpt-6.2-sol']]);
  const r = await exposedHandler(new Request('https://example.test/functions/v1/lander-content-studio-staging/generate', { method: 'POST', headers: { 'content-type':'application/json', 'x-lander-internal-token':'wrong' }, body: JSON.stringify(safe) }));
  assert.equal(r.status,403);
  assert.equal(upstreamCalls,0);
  settings.clear();
});

test('successful provider response is structured, unposted and metered', async () => {
  settings = new Map([['LANDER_STUDIO_ENABLED','true'],['LANDER_STUDIO_BUDGET_APPROVED','true'],['OPENAI_API_KEY','test-not-real'],['LANDER_STUDIO_INTERNAL_TOKEN','test-secret'],['LANDER_STUDIO_MODEL','gpt-6.2-sol']]);
  globalThis.fetch = async (_, opts) => {
    upstreamCalls++;
    const outbound = JSON.parse(opts.body);
    assert.equal(outbound.model,'gpt-6.2-sol');
    assert.equal(outbound.store,false);
    assert.equal(outbound.reasoning.effort,'low');
    assert.equal(outbound.text.format.type,'json_schema');
    return new Response(JSON.stringify({ usage:{input_tokens:1000, output_tokens:500}, output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({title:'Um treino melhor',hook:'Uma pergunta',script:'Script',shots:[],caption:'Texto',cta:'Veja mais',hashtags:[],claims_to_verify:[]})}]}] }), { status: 200 });
  };
  const r = await exposedHandler(new Request('https://example.test/functions/v1/lander-content-studio-staging/generate', { method:'POST',headers:{'content-type':'application/json','x-lander-internal-token':'test-secret'},body:JSON.stringify(safe) }));
  const out = await r.json();
  assert.equal(r.status,200);
  assert.equal(out.published,false);
  assert.equal(out.stage,'editorial_review_required');
  assert.equal(out.usage.estimated_standard_model_cost_usd,0.007);
  assert.equal(upstreamCalls,1);
  settings.clear();
});