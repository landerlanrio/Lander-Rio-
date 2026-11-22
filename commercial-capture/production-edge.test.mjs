import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createProductionCaptureHandler,PRODUCTION_PROJECT_URL,PRODUCTION_ALLOWED_ORIGINS,PRODUCTION_CAPTURE_VERSION} from './production-edge.mjs';
import {createEdgeBridge,createEdgeHealth} from './edge-bridge.mjs';
const key='synthetic-production-candidate-only-key',env={get:k=>({SUPABASE_URL:PRODUCTION_PROJECT_URL,SUPABASE_SERVICE_ROLE_KEY:key})[k]};
const input=()=>({request_id:randomUUID(),profile:'atacado',intent:'orcamento',email:'candidate@example.org',name:'Ficticio',origin:{entry_path:'/',page_path:'/atacado/'},privacy_ack:true});
const req=(body=input(),origin=PRODUCTION_ALLOWED_ORIGINS[0])=>new Request(PRODUCTION_PROJECT_URL+'/functions/v1/commercial-capture-entry',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
test('production candidate accepts a normal email and both official origins, with no CRM or legacy-table call',async()=>{
 for(const origin of PRODUCTION_ALLOWED_ORIGINS){
  const calls=[];const h=createProductionCaptureHandler({env,fetchImpl:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return Response.json(url.endsWith('/allow_commercial_capture_request')?{allowed:true}:{saved:true,receipt:'LR-'+randomUUID().replaceAll('-','').toUpperCase(),duplicate:false,crm_status:'pending'});}});
  const r=await h(req(input(),origin));assert.equal(r.status,201);assert.equal(r.headers.get('x-lander-capture-version'),PRODUCTION_CAPTURE_VERSION);assert.deepEqual(calls.map(c=>c.url),[PRODUCTION_PROJECT_URL+'/rest/v1/rpc/allow_commercial_capture_request',PRODUCTION_PROJECT_URL+'/rest/v1/rpc/capture_commercial_request']);assert.equal(calls[1].body.p_record.email,'candidate@example.org');assert.equal((await r.json()).crm_status,'pending');
 }
});
test('production candidate rejects an accidental staging project or unrelated Origin without network calls',async()=>{
 let hits=0;const fetchImpl=async()=>{hits++;throw Error('must not call');};
 assert.equal((await createProductionCaptureHandler({env,fetchImpl})(req(input(),'https://lander-rio-commercial-hml-20261122.netlify.app'))).status,403);
 const other={get:k=>k==='SUPABASE_URL'?'https://riplqdzgwlggvhbznovm.supabase.co':key};assert.equal((await createProductionCaptureHandler({env:other,fetchImpl})(req())).status,503);assert.equal(hits,0);
});
test('production bridge requires explicit production mode and exact fixed endpoint',async()=>{
 const configuration={endpoint:PRODUCTION_PROJECT_URL+'/functions/v1/commercial-capture-entry',origin:PRODUCTION_ALLOWED_ORIGINS[0],key};let hits=0;
 const fetchImpl=async(url,options)=>{hits++;assert.equal(options.headers.origin,PRODUCTION_ALLOWED_ORIGINS[1]);return Response.json({ok:true,saved:true,receipt:'LR-'+randomUUID().replaceAll('-','').toUpperCase(),crm_status:'pending'},{status:201});};
 assert.equal((await createEdgeBridge({...configuration,fetchImpl})(req())).status,503);assert.equal(hits,0);
 const response=await createEdgeBridge({...configuration,environment:'production',fetchImpl})(req(input(),PRODUCTION_ALLOWED_ORIGINS[1]));assert.equal(response.status,201);assert.equal(response.headers.get('x-lander-capture-version'),PRODUCTION_CAPTURE_VERSION);
 assert.equal((await createEdgeBridge({...configuration,environment:'production',endpoint:configuration.endpoint+'/arbitrary',fetchImpl})(req())).status,503);
});
test('production health proves only dedicated queue readiness and declares no outbound integrations',async()=>{
 const h=createProductionCaptureHandler({env,fetchImpl:async(url)=>{assert.equal(url,PRODUCTION_PROJECT_URL+'/rest/v1/commercial_requests?select=request_id&limit=0');return Response.json([]);}});
 const request=new Request(PRODUCTION_PROJECT_URL+'/functions/v1/commercial-capture-entry/health',{headers:{origin:PRODUCTION_ALLOWED_ORIGINS[0]}});const response=await h(request);const metadata=await response.json();assert.equal(metadata.environment,'production');assert.equal(metadata.supabase_project_id,'artcokrtuqppgtawuczq');assert.equal(metadata.crm_sync_enabled,false);assert.equal(metadata.outbound_enabled,false);
 const bridge=createEdgeHealth({endpoint:PRODUCTION_PROJECT_URL+'/functions/v1/commercial-capture-entry',origin:PRODUCTION_ALLOWED_ORIGINS[0],key,environment:'production',fetchImpl:async()=>Response.json(metadata)});assert.equal((await bridge(new Request('https://landerrio.com.br/api/commercial/health'))).status,200);
});
