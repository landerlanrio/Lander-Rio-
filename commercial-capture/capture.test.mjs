import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {CaptureError,createCaptureHandler,normalize} from './core.mjs';
import {SQLiteStore} from './sqlite-store.mjs';
import {createSupabaseStore} from './supabase-store.mjs';
import {createHubSpotCRM,reconcileOne} from './reconcile.mjs';
const data=overrides=>({request_id:randomUUID(),profile:'varejo',intent:'consulta',name:'Teste fictício',email:'qa@example.test',privacy_ack:true,website:'',origin:{entry_path:'/',page_path:'/varejo/',utm_source:'instagram',utm_medium:'bio',utm_campaign:'lr-20261122'},...overrides});
const request=d=>new Request('https://landerrio.com.br/api/commercial/lead',{method:'POST',headers:{origin:'https://landerrio.com.br','content-type':'application/json'},body:JSON.stringify(d)});
function fixture(){const dir=mkdtempSync(join(tmpdir(),'lr-capture-')),path=join(dir,'qa.sqlite');const store=new SQLiteStore(path);return {dir,path,store,done(){store.close();rmSync(dir,{recursive:true,force:true});}};}
test('only committed records receive confirmation; CRM outage remains recoverable once',async()=>{
 const f=fixture();try{
  const h=createCaptureHandler({store:f.store}),d=data();const r=await h(request(d));assert.equal(r.status,201);const b=await r.json();assert.equal(b.saved,true);assert.equal(b.crm_status,'pending');
  const rs=await Promise.all([h(request(d)),h(request(d))]);assert.deepEqual(rs.map(x=>x.status),[200,200]);assert.equal(f.store.list().length,1);assert.deepEqual(f.store.list()[0].origin,d.origin);
  assert.equal((await reconcileOne({store:f.store,crm:{upsertContact:async()=>{throw Error('capacity');}}})).status,'pending');
  assert.equal(f.store.list()[0].crm_status,'pending');
  const contacts=new Map(),crm={upsertContact:async x=>{contacts.set(x.email,{id:'synthetic-contact-1'});return contacts.get(x.email);}};
  assert.equal((await reconcileOne({store:f.store,crm})).status,'synced');assert.equal((await reconcileOne({store:f.store,crm})).status,'empty');assert.equal(contacts.size,1);assert.equal(f.store.list().length,1);assert.equal(f.store.list()[0].crm_contact_id,'synthetic-contact-1');
 }finally{f.done();}
});
test('commit survives process/store restart and lost response retry',async()=>{
 const f=fixture(),d=normalize(data());await f.store.save(d);f.store.close();const restarted=new SQLiteStore(f.path);
 try{const b=await restarted.save(d);assert.equal(b.duplicate,true);assert.equal(restarted.list().length,1);assert.equal(restarted.list()[0].request_id,d.request_id);}finally{restarted.close();rmSync(f.dir,{recursive:true,force:true});}
});
test('idempotency conflict never overwrites an accepted request',async()=>{
 const f=fixture();try{const d=data();const h=createCaptureHandler({store:f.store});await h(request(d));const r=await h(request({...d,intent:'suporte'}));assert.equal(r.status,409);assert.equal(f.store.list()[0].intent,'consulta');assert.equal(f.store.list().length,1);}finally{f.done();}
});
test('unavailable or dishonest storage never confirms, or leaks errors',async()=>{
 for(const store of [{save:async()=>{throw Error('sensitive@example.test token=secret');}},{save:async()=>({saved:false,receipt:'LR-FAKE'})}]){const r=await createCaptureHandler({store})(request(data()));assert.equal(r.status,503);assert.deepEqual(await r.json(),{ok:false,error:'temporarily_unavailable'});}
});
test('validation excludes personal fields from origin and rejects invalid requests',async()=>{
 const d=normalize(data({origin:{entry_path:'/person/john-smith/',page_path:'/varejo/?email=person@example.test',utm_source:'person@example.test',utm_medium:'social',utm_campaign:'my-personal-name',referrer:'https://secret.test?phone=5555555'}}));assert.deepEqual(d.origin,{entry_path:'/',page_path:'/',utm_medium:'social'});
 const f=fixture();try{const h=createCaptureHandler({store:f.store});for(const change of [{website:'spam'},{request_id:'bad'},{privacy_ack:false},{email:'bad'},{intent:'unknown'},{extra:'secret'}])assert.equal((await h(request(data(change)))).status,400);assert.equal(f.store.list().length,0);const r=await h(new Request('https://landerrio.com.br',{method:'POST',headers:{origin:'https://evil.test','content-type':'application/json'},body:JSON.stringify(data())}));assert.equal(r.status,403);}finally{f.done();}
});
test('only one operator claims a pending request; failed CRM request can retry',async()=>{
 const f=fixture();try{await f.store.save(normalize(data()));const claims=await Promise.all([f.store.claim(),f.store.claim()]);assert.equal(claims.filter(Boolean).length,1);assert.equal(await f.store.finish(claims[0].request_id,'wrong-token','forged'),false);await f.store.release(claims[0].request_id,claims[0].claim_token);assert.ok(await f.store.claim());}finally{f.done();}
});
test('Supabase adapter uses RPC acknowledgment and does not expose secrets',async()=>{
 let call;const store=createSupabaseStore({url:'https://synthetic.supabase.co',key:'synthetic-secret',fetchImpl:async(url,opts)=>{call={url,opts};return Response.json({saved:true,receipt:'LR-'+randomUUID().replaceAll('-','').toUpperCase(),crm_status:'pending',duplicate:false});}});
 const h=createCaptureHandler({store}),r=await h(request(data()));assert.equal(r.status,201);assert.equal(call.url,'https://synthetic.supabase.co/rest/v1/rpc/capture_commercial_request');assert.equal(call.opts.headers.Authorization,'Bearer synthetic-secret');assert.doesNotMatch(await r.text(),/synthetic-secret/);
 const conflict=createSupabaseStore({url:'https://synthetic.supabase.co',key:'secret',fetchImpl:async()=>Response.json({message:'idempotency_conflict'},{status:400})});assert.equal((await createCaptureHandler({store:conflict})(request(data()))).status,409);
});
test('HubSpot adapter upserts by stable email instead of creating duplicate contacts',async()=>{
 let sent;const crm=createHubSpotCRM({token:'synthetic-only',fetchImpl:async(url,opts)=>{sent={url,body:JSON.parse(opts.body)};return Response.json({results:[{id:'test-123'}]});}});
 assert.deepEqual(await crm.upsertContact({email:'qa@example.test',name:'QA'}),{id:'test-123'});assert.equal(sent.body.inputs[0].idProperty,'email');assert.equal(sent.body.inputs[0].id,'qa@example.test');assert.match(sent.url,/batch\/upsert$/);
});
test('CRM timeout after its commit retries one contact and preserves immutable request context',async()=>{
 const f=fixture();try{
  const d=normalize(data({profile:'atacado',intent:'envio'}));await f.store.save(d);
  let loseResponse=true;const contacts=new Map(),crm={upsertContact:async x=>{if(!contacts.has(x.email))contacts.set(x.email,{id:'synthetic-contact-timeout'});if(loseResponse){loseResponse=false;throw Error('response lost after CRM commit');}return contacts.get(x.email);}};
  assert.equal((await reconcileOne({store:f.store,crm})).status,'pending');assert.equal(contacts.size,1);
  assert.equal((await reconcileOne({store:f.store,crm})).status,'synced');assert.equal(contacts.size,1);assert.equal(f.store.list()[0].profile,'atacado');assert.equal(f.store.list()[0].intent,'envio');assert.deepEqual(f.store.list()[0].origin,d.origin);
 }finally{f.done();}
});
test('expired claim is reclaimed and stale operator cannot mark the new claim',async()=>{
 const f=fixture();try{await f.store.save(normalize(data()));const first=await f.store.claim();f.store.db.prepare('UPDATE commercial_requests SET claim_until=0 WHERE request_id=?').run(first.request_id);const second=await f.store.claim();assert.ok(second);assert.notEqual(first.claim_token,second.claim_token);assert.equal(await f.store.finish(first.request_id,first.claim_token,'stale'),false);assert.equal(await f.store.finish(second.request_id,second.claim_token,'valid'),true);}finally{f.done();}
});
test('actual Netlify function fails closed without env and calls configured RPC without leaking keys',async()=>{
 const {default:handler,config}=await import('../netlify/functions/commercial-lead.mjs');
 const oldNetlify=globalThis.Netlify,oldFetch=globalThis.fetch;
 try{
  globalThis.Netlify={env:{get:()=>undefined}};
  const missing=await handler(request(data()));assert.equal(missing.status,503);assert.deepEqual(await missing.json(),{ok:false,error:'temporarily_unavailable'});
  globalThis.Netlify={env:{get:key=>({COMMERCIAL_SUPABASE_URL:'https://synthetic.supabase.co',COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY:'synthetic-server-only-secret'})[key]}};
  let hit=0;globalThis.fetch=async(url,opts)=>{assert.equal(url,'https://synthetic.supabase.co/rest/v1/rpc/capture_commercial_request');assert.equal(opts.headers.apikey,'synthetic-server-only-secret');hit++;return Response.json({saved:true,receipt:'LR-'+randomUUID().replaceAll('-','').toUpperCase(),duplicate:false,crm_status:'pending'});};
  const response=await handler(request(data()));assert.equal(response.status,201);assert.equal(hit,1);assert.doesNotMatch(await response.text(),/secret|supabase/);
  globalThis.Netlify={env:{get:key=>({COMMERCIAL_SUPABASE_URL:'https://synthetic.supabase.co',COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY:'synthetic-server-only-secret',COMMERCIAL_ALLOWED_ORIGIN:'https://isolated.example.test'})[key]}};
  const stagingRequest=new Request('https://isolated.example.test/api/commercial/lead',{method:'POST',headers:{origin:'https://isolated.example.test','content-type':'application/json'},body:JSON.stringify(data())});
  assert.equal((await handler(stagingRequest)).status,201);assert.equal((await handler(request(data()))).status,403);
  assert.equal(config.path,'/api/commercial/lead');assert.equal(config.rateLimit.windowLimit,10);
 }finally{globalThis.Netlify=oldNetlify;globalThis.fetch=oldFetch;}
});
