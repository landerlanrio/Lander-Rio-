// ROX 3 private preview — actual Node HTTP server -> actual ROX 3 TypeScript handler.
import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {startPrivatePreview} from './server.mjs';

let server,base,networkOutside=0;
const realFetch=globalThis.fetch;
before(async()=>{
 const demo=await startPrivatePreview(0);
 server=demo.server;base=demo.url;
 globalThis.fetch=(url,options)=>{
  const u=typeof url==='string'?url:url?.url;
  if(!String(u).startsWith(base+'/')){networkOutside++;throw Error('External request prohibited by ROX preview test');}
  return realFetch(url,options);
 };
});
after(async()=>{
 globalThis.fetch=realFetch;
 if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
async function chat(message,messages){
 const r=await fetch(base+'/api/rox/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:messages||[{role:'user',content:message}]})});
 return {status:r.status,body:await r.json(),headers:r.headers};
}

test('private preview only serves local static files with strict CSP',async()=>{
 const r=await fetch(base+'/');
 const html=await r.text();
 assert.equal(r.status,200);
 assert.match(html,/HOMOLOGAÇÃO PRIVADA/);
 assert.match(r.headers.get('content-security-policy'),/default-src 'none'/);
 assert.match(r.headers.get('content-security-policy'),/connect-src 'self'/);
 assert.equal(r.headers.get('cache-control'),'no-store, max-age=0');
 assert.doesNotMatch(html,/https:\/\/wa\.me|script src="https:/i);
 const missing=await fetch(base+'/unexpected');assert.equal(missing.status,404);
});
test('health proves ROX 3.0 offline and no paid activation',async()=>{
 const r=await fetch(base+'/api/rox/health');
 const data=await r.json();
 assert.equal(data.ai_enabled,false);
 assert.equal(data.environment,'staging');
 assert.match(data.agent_version,/^3\./);
});
test('hello is answered by real backend over HTTP',async()=>{
 const r=await chat('Oi');
 assert.equal(r.status,200);
 assert.equal(r.body.mode,'offline');
 assert.match(r.body.reply,/ROX/);
});
test('wholesale handoff includes no actual writes, sends or conversations',async()=>{
 const r=await chat('Quero revender no atacado');
 assert.equal(r.status,200);
 assert.equal(r.body.mode,'handoff');
 assert.equal(r.body.qualification.segment,'atacado');
 assert.equal(r.body.integrations.whatsapp.sent,false);
 assert.equal(r.body.integrations.whatsapp.conversation_confirmed,false);
 assert.equal(r.body.integrations.hubspot.synced,false);
 assert.equal(r.body.integrations.supabase.row_written,false);
});
test('two-turn conversation preserves segment and improves qualification',async()=>{
 const arr=[
  {role:'user',content:'Quero revender no atacado'},
  {role:'assistant',content:'Qual o assunto?'},
  {role:'user',content:'Quero catálogo'}
 ];
 const r=await chat(null,arr);
 assert.equal(r.status,200);
 assert.equal(r.body.qualification.segment,'atacado');
 assert.equal(r.body.qualification.topic_id,'catalogo');
 assert.equal(r.body.qualification.stage,'ready_for_human');
});
test('retail and consumer electronics are not mixed',async()=>{
 const a=await chat('Quero comprar no varejo');
 const b=await chat('Quanto custa um iPhone?');
 assert.equal(a.body.qualification.segment,'varejo');
 assert.equal(b.body.mode,'offline');
 assert.equal(b.body.integrations,undefined);
});
test('medical and PII requests must never have commercial CTA',async()=>{
 for(const q of ['Quero comprar Ozempic','Retatrutida no atacado']){
  const r=await chat(q);
  assert.equal(r.body.mode,'clinical');
  assert.equal(r.body.integrations,undefined);
 }
 const p=await chat('Meu e-mail é contato@teste.com');
 assert.equal(p.body.mode,'privacy');
 assert.equal(p.body.integrations,undefined);
});
test('bad content-type and oversize request fail closed',async()=>{
 const wrong=await fetch(base+'/api/rox/chat',{method:'POST',headers:{'content-type':'text/plain'},body:'oi'});
 assert.equal(wrong.status,415);
 const big=await fetch(base+'/api/rox/chat',{method:'POST',headers:{'content-type':'application/json'},body:' '.repeat(18001)});
 assert.equal(big.status,413);
});
test('frontend has textContent rendering, no browser persistence or real WhatsApp link',async()=>{
 const s=await readFile(new URL('./preview.js',import.meta.url),'utf8');
 assert.match(s,/bubble\.textContent/);
 assert.match(s,/credentials:'omit'/);
 assert.doesNotMatch(s,/localStorage|sessionStorage|indexedDB|\.innerHTML\s*=|wa\.me|graph\.facebook\.com/);
 assert.match(s,/w\.sent!==false/);
});
test('frontend and server never point to nonlocal paid model endpoints',async()=>{
 const frontend=await readFile(new URL('./preview.js',import.meta.url),'utf8');
 const serverSrc=await readFile(new URL('./server.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(frontend,/api\.openai\.com|api\.groq\.com|supabase\.co/);
 assert.match(serverSrc,/server\.listen\(port,'127\.0\.0\.1'/);
 assert.match(serverSrc,/get:\(\)=>undefined/);
 assert.equal(networkOutside,0);
});
