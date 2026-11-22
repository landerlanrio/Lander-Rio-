import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createStagingCaptureHandler,STAGING_PROJECT_URL,STAGING_ALLOWED_ORIGIN,STAGING_CAPTURE_VERSION} from './staging-edge.mjs';
const data=changes=>({request_id:randomUUID(),profile:'varejo',intent:'envio',email:'edge-qa@example.test',origin:{entry_path:'/',page_path:'/varejo/'},privacy_ack:true,...changes});
const env={get:key=>({SUPABASE_URL:STAGING_PROJECT_URL,SUPABASE_SERVICE_ROLE_KEY:'synthetic-staging-only-key'})[key]};
const req=(body=data(),origin=STAGING_ALLOWED_ORIGIN)=>new Request(STAGING_PROJECT_URL+'/functions/v1/commercial-capture-hml',{method:'POST',headers:{origin,'content-type':'application/json','x-forwarded-for':'192.0.2.123'},body:JSON.stringify(body)});
test('staging edge saves only through guarded project and durable rate RPC, without exposing IP or credentials',async()=>{
 const calls=[];const h=createStagingCaptureHandler({env,fetchImpl:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return Response.json(url.endsWith('/allow_commercial_staging_request')?{allowed:true}:{saved:true,receipt:'LR-'+randomUUID().replaceAll('-','').toUpperCase(),duplicate:false,crm_status:'pending'});}});
 const r=await h(req());assert.equal(r.status,201);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-lander-capture-version'),STAGING_CAPTURE_VERSION);assert.equal(calls.length,2);assert.match(calls[0].body.p_key,/^[a-f0-9]{64}$/);assert.doesNotMatch(JSON.stringify(calls),/192\.0\.2\.123|synthetic-staging-only-key/);assert.equal(calls[1].body.p_record.origin.page_path,'/varejo/');assert.doesNotMatch(await r.text(),/key|192\.0\.2/);
});
test('staging guard rejects wrong project, origin, non-synthetic data or honeypot before any database call',async()=>{
 let hits=0;const fetchImpl=async()=>{hits++;throw Error('must not call');};
 const h=createStagingCaptureHandler({env,fetchImpl});assert.equal((await h(req(data(),'https://landerrio.com.br'))).status,403);assert.equal((await h(req(data({email:'person@example.com'})))).status,400);assert.equal((await h(req(data({website:'spam'})))).status,400);
 const wrong=createStagingCaptureHandler({env:{get:k=>k==='SUPABASE_URL'?'https://production.supabase.co':'synthetic-key'},fetchImpl});assert.equal((await wrong(req())).status,503);assert.equal(hits,0);
});
test('durable limiter denial or RPC failure never attempts contact storage',async()=>{
 for(const denied of [false,true]){let hits=0;const h=createStagingCaptureHandler({env,fetchImpl:async()=>{hits++;return denied?Response.json({allowed:false,retry_after:30}):Response.json({error:'unavailable'},{status:503});}});const r=await h(req());assert.equal(r.status,denied?429:503);assert.equal(hits,1);if(denied)assert.equal(r.headers.get('retry-after'),'30');}
});
test('edge health proves protected table is readable without returning a contact',async()=>{
 let hit;const h=createStagingCaptureHandler({env,fetchImpl:async(url,options)=>{hit={url,options};return Response.json([]);}});
 const r=await h(new Request(STAGING_PROJECT_URL+'/functions/v1/commercial-capture-hml/health',{headers:{origin:STAGING_ALLOWED_ORIGIN}}));
 assert.equal(r.status,200);assert.equal(hit.url,STAGING_PROJECT_URL+'/rest/v1/commercial_requests?select=request_id&limit=0');const body=await r.json();assert.equal(body.storage_ready,true);assert.equal(body.crm_sync_enabled,false);assert.equal(body.outbound_enabled,false);assert.equal(body.supabase_project_id,'riplqdzgwlggvhbznovm');assert.doesNotMatch(JSON.stringify(body),/@|secret|key/);
});
