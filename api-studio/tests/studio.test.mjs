import test from 'node:test';
import assert from 'node:assert/strict';
let upstreamCalls = 0;
let reserveCalls = 0;
let handler;
let vars = new Map();
let reserveOk = true;
const fakeSecret='dev-not-real';
globalThis.Deno = { env: { get(name) { return vars.get(name); } }, serve(fn) { handler = fn; } };
const data={format:'reel',topic:'Técnica de agachamento sem sobrecarregar os joelhos',audience:'fitness',source_facts:[]};
const setValid = () => vars = new Map([
  ['LANDER_STUDIO_ENABLED','true'], ['LANDER_STUDIO_BUDGET_APPROVED','true'],
  ['OPENAI_API_KEY','fake-openai-key'], ['LANDER_STUDIO_INTERNAL_TOKEN',fakeSecret],
  ['LANDER_STUDIO_MODEL','gpt-6.2-sol'], ['SUPABASE_URL','https://testing.supabase.co'],
  ['SUPABASE_SERVICE_ROLE_KEY','fake-database-secret'],
]);
const mock = () => { upstreamCalls=0; reserveCalls=0;globalThis.fetch = async (url,opts) => {
  if (String(url).endsWith('/rpc/lander_ai_reserve_staging')) {
    reserveCalls++;
    const body=JSON.parse(opts.body);
    assert.equal(body.p_service,'content-studio-staging');
    assert.equal(body.p_reserved_micro_usd,65000);
    assert.equal(opts.headers.apikey,'fake-database-secret');
    return new Response(JSON.stringify(reserveOk), {status:200,headers:{'content-type':'application/json'}});
  }
  assert.equal(url,'https://api.openai.com/v1/responses');
  upstreamCalls++;
  const outbound=JSON.parse(opts.body);
  assert.equal(outbound.model,'gpt-6.2-sol');
  assert.equal(outbound.store,false);
  assert.equal(outbound.reasoning.effort,'low');
  assert.equal(outbound.max_output_tokens,1800);
  return new Response(JSON.stringify({usage:{input_tokens:1000,output_tokens:500},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({title:'Roteiro',hook:'Gancho',script:'Texto',shots:[],caption:'Legenda',cta:'Leia mais',hashtags:[],claims_to_verify:[]})}]}]}),{status:200});
};};
mock();
const m=await import('../supabase/functions/lander-content-studio-staging/index.ts');
const req=(token=fakeSecret)=>new Request('https://testing.supabase.co/functions/v1/lander-content-studio-staging/generate',{method:'POST',headers:{'content-type':'application/json','x-lander-internal-token':token},body:JSON.stringify(data)});

test('valid topic and schema',()=>{
  assert.equal(m.validateInput(data).ok,true);
  assert.equal(m.validateInput({...data,format:'fake'}).ok,false);
  assert.equal(m.validateInput({...data,source_facts:Array(7).fill('abc')}).ok,false);
  assert.equal(m.isSafeEditorialTopic('Vender tirzepatida'),false);
  assert.equal(m.isSafeEditorialTopic('fale com x@y.com'),false);
});
test('denies missing budget gates, key, model, internal token, or database secret',()=>{
  vars.clear();assert.equal(m.enabled(),false);
  setValid();assert.equal(m.enabled(),true);
  for(const k of ['LANDER_STUDIO_BUDGET_APPROVED','OPENAI_API_KEY','LANDER_STUDIO_MODEL','LANDER_STUDIO_INTERNAL_TOKEN','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']){
    const v=vars.get(k);vars.delete(k);assert.equal(m.enabled(),false,k);vars.set(k,v);
  }
  vars.clear();
});
test('disabled endpoint cannot spend credits',async()=>{
  vars.clear();mock();const r=await handler(req());assert.equal(r.status,503);assert.equal(upstreamCalls,0);assert.equal(reserveCalls,0);
});
test('health discloses no secrets and reports hard quota',async()=>{
  vars.clear();const r=await handler(new Request('https://testing.supabase.co/functions/v1/lander-content-studio-staging/health'));
  assert.equal(r.status,200);const o=await r.json();assert.equal(o.ready,false);assert.equal(o.lifetime_staging_budget_usd,1);
  assert.equal(JSON.stringify(o).includes('fake'),false);
});
test('internal token blocks before reservation',async()=>{
  setValid();mock();const r=await handler(req('wrong'));assert.equal(r.status,403);assert.equal(upstreamCalls,0);assert.equal(reserveCalls,0);vars.clear();
});
test('quota denies paid model even when all keys present',async()=>{
  setValid();mock();reserveOk=false;const r=await handler(req());assert.equal(r.status,429);assert.equal(reserveCalls,1);assert.equal(upstreamCalls,0);reserveOk=true;vars.clear();
});
test('database outage fails closed (no paid requests)',async()=>{
  setValid();mock();globalThis.fetch=async()=>{throw Error('no connection')};
  const r=await handler(req());assert.equal(r.status,429);assert.equal(upstreamCalls,0);vars.clear();mock();
});
test('only reserved calls reach the provider, responses are drafts',async()=>{
  setValid();mock();const r=await handler(req());const o=await r.json();assert.equal(r.status,200);assert.equal(o.published,false);assert.equal(o.stage,'editorial_review_required');assert.equal(o.usage.estimated_standard_model_cost_usd,0.007);
  assert.equal(upstreamCalls,1);assert.equal(reserveCalls,1);vars.clear();
});
test('fixed prices correspond to approved model and model allowlist',()=>{
  assert.equal(m.estimatedCostUsd('gpt-6.2-sol',1000,500),.007);
  assert.equal(m.estimatedCostUsd('no-model',1000,500),null);
  vars.set('LANDER_STUDIO_MODEL','some-random-model');assert.equal(m.selectedModel(),null);vars.clear();
});
test('rejects malformed JSON and oversized or private content before reserving',async()=>{
  setValid();mock();const r=await handler(new Request('https://testing.supabase.co/functions/v1/lander-content-studio-staging/generate',{method:'POST',headers:{'content-type':'application/json','x-lander-internal-token':fakeSecret},body:JSON.stringify({...data,topic:'vender HGH'})}));
  assert.equal(r.status,422);assert.equal(upstreamCalls,0);assert.equal(reserveCalls,0);vars.clear();
});