// LANDER RIO ROX 2.0 — isolated, zero-network, zero-billing Node 22 tests.
// Never import through a deployed Supabase URL. These tests only execute local source.
import {test, after} from 'node:test';
import assert from 'node:assert/strict';

const env=new Map();
let served;
globalThis.Deno={env:{get:key=>env.get(key)},serve:fn=>{served=fn}};
const realFetch=globalThis.fetch;
let calls=[];
globalThis.fetch=async (...args)=>{calls.push(args);throw Error('Unexpected external network request during tests')};
after(()=>{globalThis.fetch=realFetch;env.clear()});
const {handler,originAllowed,validateMessages,classifyIntent,offlineReply,parseOutput,modelInstructions}=await import('./index.ts');
const startReq=(content,{origin='https://landerrio.com.br',messages,method='POST',path='/chat',headers={}}={})=>new Request('https://example.invalid'+path,{method,headers:{origin,'content-type':'application/json',...headers},...(method==='POST'?{body:JSON.stringify({messages:messages||[{role:'user',content}]})}:{})});
async function execute(content,options){const res=await handler(startReq(content,options));return {status:res.status,data:await res.json(),headers:res.headers}};
const reset=()=>{env.clear();calls=[]};

test('module registers an isolated server handler',()=>assert.equal(served,handler));
test('only exact first-party HTTPS origins allowed',()=>{
 for(const x of ['https://landerrio.com.br','https://www.landerrio.com.br'])assert.equal(originAllowed(x),true,x);
 for(const x of ['https://livecodes.io','https://sandbox.livecodes.io','https://landerrio.com.br.evil.test','http://landerrio.com.br','https://attacker.test','https://landerrio.com.br:8443',null,'bad'])assert.equal(originAllowed(x),false,String(x));
});
test('commercial classifications do not confuse generic consumer questions',()=>{
 for(const q of ['Quanto custa seu iPhone?','Qual é o valor da passagem?','Quanto custa um restaurante?','Qual o preço do cinema?','Oi, tudo bem?'])assert.equal(classifyIntent(q).intent,'general',q);
 for(const q of ['Quero revender no atacado','Qual o meu pedido?','Tem estoque?','Onde está a entrega?','Qual o valor da LANDER?'])assert.equal(classifyIntent(q).intent,'commercial',q);
});
test('commercial context follows an explicit prior inquiry',()=>{
 assert.equal(classifyIntent('Qual o valor?', [{role:'user',content:'Quero revender no atacado'}]).intent,'commercial');
 assert.equal(classifyIntent('Quanto custa?', [], {segment:'b2b'}).intent,'commercial');
});
test('regulated medication references route to clinical, never sales',()=>{
 for(const q of ['Qual preço da tirzepatida?','Quero comprar testosterona','Me diz a dose de retatrutida','Tem HGH?'])assert.equal(classifyIntent(q).intent,'clinical',q);
});
test('common fitness, free tools, brand, and greeting questions have offline responses',()=>{
 for(const q of ['Oi','Quem é a LANDER?','Onde vocês ficam?','Como funciona a ferramenta de treino?','A dieta é grátis?','Como ter hipertrofia?','Como o sono afeta o treino?','Como falar com a equipe?','Obrigado']){
  const r=offlineReply(q);assert.ok(r?.reply?.length>30,q);assert.ok(!/R\$\s*\d/.test(r.reply));
 }
 assert.equal(offlineReply('qual a cotação exata de libra esterlina?'),null);
});
test('message validation limits history, empty message, client fields and PII in history',()=>{
 assert.equal(validateMessages(null).ok,false);
 assert.equal(validateMessages({messages:[]}).ok,false);
 assert.equal(validateMessages({messages:[{role:'user',content:'x'.repeat(701)}]}).ok,false);
 assert.equal(validateMessages({messages:[{role:'assistant',content:'Oi'}]}).ok,false);
 assert.equal(validateMessages({messages:[{role:'assistant',content:'Contato meu@email.com'},{role:'user',content:'oi'}]}).error,'sensitive_data_not_allowed');
 assert.equal(validateMessages({messages:[{role:'user',content:'Oi'}]}).ok,true);
});
test('origin OPTIONS and CORS enforce isolation',async()=>{
 const o=await handler(startReq('',{method:'OPTIONS'}));assert.equal(o.status,204);
 assert.equal(o.headers.get('access-control-allow-origin'),'https://landerrio.com.br');
 const e=await handler(startReq('',{method:'OPTIONS',origin:'https://evil.test'}));assert.equal(e.status,403);
});
test('POST rejects unknown origins before handling body',async()=>{
 reset();const r=await execute('Oi',{origin:'https://evil.test'});assert.equal(r.status,403);assert.equal(calls.length,0);
});
test('basic greeting works without AI credentials and without external calls',async()=>{
 reset();const r=await execute('Oi');assert.equal(r.status,200);assert.equal(r.data.mode,'offline');assert.match(r.data.reply,/ROX/);assert.equal(calls.length,0);
});
test('free training instructions and diet instructions work without model calls',async()=>{
 reset();for(const q of ['Onde está a ferramenta de treino?','Como uso a dieta?']){
  const r=await execute(q);assert.equal(r.status,200);assert.match(r.data.reply,/landerrio.com.br/);
 }
 assert.equal(calls.length,0);
});
test('unknown general question gets honest fallback, not fake answer, no network',async()=>{
 reset();const r=await execute('Qual a raiz quadrada de 289?');assert.equal(r.status,200);assert.equal(r.data.mode,'offline');assert.match(r.data.reply,/não tenho uma resposta confiável/i);assert.equal(calls.length,0);
});
test('commercial handoff never sends WhatsApp or claims the conversation happened',async()=>{
 reset();const r=await execute('Quero revender no atacado');assert.equal(r.status,200);assert.equal(r.data.mode,'handoff');assert.match(r.data.reply,/você decide/i);assert.equal(calls.length,0);
});
test('clinical questions do not quote prices or forward medicine purchases',async()=>{
 reset();const r=await execute('Tem testosterona para vender?');assert.equal(r.status,200);assert.equal(r.data.mode,'clinical');assert.doesNotMatch(r.data.reply,/estoque|preço|comprar agora/i);assert.equal(calls.length,0);
});
test('messages containing personal email return privacy warning without external calls',async()=>{
 reset();const r=await execute('Meu contato é pessoa@teste.com');assert.equal(r.status,200);assert.equal(r.data.mode,'privacy');assert.equal(calls.length,0);
});
test('malformed and excessive POST body are rejected before model calls',async()=>{
 reset();let r=await handler(new Request('https://example.invalid/chat',{method:'POST',headers:{origin:'https://landerrio.com.br','content-type':'text/plain'},body:'not json'}));assert.equal(r.status,415);
 r=await handler(new Request('https://example.invalid/chat',{method:'POST',headers:{origin:'https://landerrio.com.br','content-type':'application/json'},body:'no'}));assert.equal(r.status,400);
 assert.equal(calls.length,0);
});
test('health explicitly reports no paid model until all six gates are configured',async()=>{
 reset();let r=await execute('',{method:'GET',path:'/health'});assert.equal(r.data.ai_enabled,false);assert.equal(r.data.requires_approval,true);
 for(const [k,v] of Object.entries({ROX_AI_ENABLED:'true',ROX_AI_BUDGET_APPROVED:'true',OPENAI_API_KEY:'TEST-NOT-REAL',ROX_TURNSTILE_SECRET:'TEST',ROX_TURNSTILE_SITE_KEY:'TEST',ROX_AI_MODEL:'mock-model'}))env.set(k,v);
 env.delete('ROX_AI_BUDGET_APPROVED');r=await execute('',{method:'GET',path:'/health'});assert.equal(r.data.ai_enabled,false);
 assert.equal(calls.length,0);
});
test('generative request blocked by missing challenge even with fictional credentials',async()=>{
 reset();for(const [k,v] of Object.entries({ROX_AI_ENABLED:'true',ROX_AI_BUDGET_APPROVED:'true',OPENAI_API_KEY:'TEST-NOT-REAL',ROX_TURNSTILE_SECRET:'TEST',ROX_TURNSTILE_SITE_KEY:'TEST',ROX_AI_MODEL:'mock-model'}))env.set(k,v);
 const r=await execute('O que é progressão de carga?');assert.equal(r.status,403);assert.equal(r.data.error,'challenge_required');assert.equal(calls.length,0);
});
test('untrusted reply payload cannot inject malformed JSON as a successful answer',()=>{
 assert.equal(parseOutput({output_text:'NOT JSON'}),null);
 assert.equal(parseOutput({output_text:JSON.stringify({intent:'external',reply:'Hi',topic:'x'})}),null);
 const res=parseOutput({output_text:JSON.stringify({intent:'general',reply:'ok',topic:'resposta'})});assert.equal(res.intent,'general');
});
test('assistant system policy remains explicit about non-human status and restricted substances',()=>{
 const s=modelInstructions();assert.match(s,/assistente VIRTUAL/);assert.match(s,/Nunca finja ser humano/);assert.match(s,/Não ajude a comercializar medicamentos/);assert.match(s,/Nunca peça CPF/);
});