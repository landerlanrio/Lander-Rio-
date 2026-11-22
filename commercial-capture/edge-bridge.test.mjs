import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createEdgeBridge,createEdgeHealth} from './edge-bridge.mjs';
import {STAGING_PROJECT_URL,STAGING_ALLOWED_ORIGIN} from './staging-edge.mjs';
const endpoint=STAGING_PROJECT_URL+'/functions/v1/commercial-capture-hml',key='synthetic-legacy-anon-jwt-only';
const config={endpoint,key,origin:STAGING_ALLOWED_ORIGIN};
const req=(origin=STAGING_ALLOWED_ORIGIN)=>new Request(origin+'/api/commercial/lead',{method:'POST',headers:{origin,'content-type':'application/json',cookie:'private-cookie=never-forward',Authorization:'Bearer visitor-secret'},body:JSON.stringify({request_id:randomUUID(),email:'qa@example.test'})});
test('Netlify staging bridge forwards only to fixed isolated edge and validates durable acknowledgment',async()=>{
 let sent;const receipt='LR-'+randomUUID().replaceAll('-','').toUpperCase();
 const h=createEdgeBridge({...config,fetchImpl:async(url,options)=>{sent={url,options};return Response.json({ok:true,saved:true,receipt,duplicate:false,crm_status:'pending',private_token:'should-not-return'},{status:201});}});
 const r=await h(req());assert.equal(r.status,201);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(sent.url,endpoint);assert.equal(sent.options.headers.Authorization,'Bearer '+key);assert.equal(sent.options.headers.cookie,undefined);assert.deepEqual(await r.json(),{ok:true,saved:true,receipt,duplicate:false,crm_status:'pending'});
});
test('bridge fails closed for arbitrary proxy URLs, wrong origins, or missing key',async()=>{
 let hits=0;const fetchImpl=async()=>{hits++;throw Error('must not call');};
 for(const change of [{endpoint:'https://production.supabase.co/functions/v1/commercial-capture-hml'},{endpoint:endpoint+'?redirect=evil'},{origin:'https://landerrio.com.br'},{key:''}])assert.equal((await createEdgeBridge({...config,...change,fetchImpl})(req())).status,503);
 assert.equal((await createEdgeBridge({...config,fetchImpl})(req('https://evil.example.test'))).status,403);assert.equal(hits,0);
});
test('bridge sanitizes gateway failures and preserves only reviewed conflict/rate contracts',async()=>{
 for(const [status,body,expected] of [[401,{error:'JWT-secret-diagnostic'},503],[200,{ok:true,saved:false,receipt:'fake'},503],[409,{error:'idempotency_conflict'},409],[429,{error:'rate_limited'},429]]){
  const r=await createEdgeBridge({...config,fetchImpl:async()=>Response.json(body,{status,headers:{'retry-after':'30'}})})(req());assert.equal(r.status,expected);assert.doesNotMatch(await r.clone().text(),/secret-diagnostic|synthetic-legacy/);if(status===429)assert.equal(r.headers.get('retry-after'),'30');
 }
});
test('health bridge confirms exact isolated database metadata without exposing key',async()=>{
 let hit;const health=createEdgeHealth({...config,fetchImpl:async(url,options)=>{hit={url,options};return Response.json({environment:'isolated-staging',supabase_project_id:'riplqdzgwlggvhbznovm',storage_ready:true,crm_sync_enabled:false,outbound_enabled:false,version:'hml-20261122-1',private_key:key});}});
 const r=await health(new Request(STAGING_ALLOWED_ORIGIN+'/api/commercial/health'));assert.equal(r.status,200);assert.equal(hit.url,endpoint+'/health');assert.doesNotMatch(await r.text(),/synthetic-legacy|private_key/);
});
test('actual Netlify handler supports only one configured backend and never exports gateway JWT',async()=>{
 const {default:h}=await import('../netlify/functions/commercial-lead.mjs');const oldEnv=globalThis.Netlify,oldFetch=globalThis.fetch;
 const env={COMMERCIAL_EDGE_ENDPOINT:endpoint,COMMERCIAL_EDGE_ANON_KEY:key,COMMERCIAL_ALLOWED_ORIGIN:STAGING_ALLOWED_ORIGIN};
 try{
  globalThis.Netlify={env:{get:k=>env[k]}};globalThis.fetch=async()=>Response.json({ok:true,saved:true,receipt:'LR-'+randomUUID().replaceAll('-','').toUpperCase(),crm_status:'pending'},{status:201});
  const r=await h(req());assert.equal(r.status,201);assert.doesNotMatch(await r.text(),/synthetic-legacy/);
  env.COMMERCIAL_SUPABASE_URL=STAGING_PROJECT_URL;assert.equal((await h(req())).status,503);
 }finally{globalThis.Netlify=oldEnv;globalThis.fetch=oldFetch;}
});

test('health bridge rejects missing or stale runtime versions instead of claiming the expected release',async()=>{
 for(const version of [undefined,'obsolete-release']){const h=createEdgeHealth({...config,fetchImpl:async()=>Response.json({environment:'isolated-staging',supabase_project_id:'riplqdzgwlggvhbznovm',storage_ready:true,crm_sync_enabled:false,outbound_enabled:false,version})});const r=await h(new Request(STAGING_ALLOWED_ORIGIN+'/api/commercial/health'));assert.equal(r.status,503);}
});
