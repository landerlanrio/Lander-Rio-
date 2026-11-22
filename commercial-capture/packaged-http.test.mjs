// Opt-in test for the actual Netlify bundle, HTTP PostgREST and PostgreSQL.
// Uses only loopback HTTP and an explicitly synthetic local JWT fixture.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const bundle=process.env.LR_CAPTURE_BUNDLE_PATH,url=process.env.LR_CAPTURE_POSTGREST_URL;
test('packaged Netlify function -> authenticated HTTP RPC -> one durable PostgreSQL row',{skip:!bundle||!url},async()=>{
 assert.match(url,/^http:\/\/127\.0\.0\.1:\d+$/,'Only isolated loopback PostgREST is allowed');
 const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
 const unsigned=encode({alg:'HS256',typ:'JWT'})+'.'+encode({role:'service_role',exp:Math.floor(Date.now()/1000)+3600});
 const key=unsigned+'.'+createHmac('sha256','lr-qa-only-jwt-secret-at-least-32-characters').update(unsigned).digest('base64url');
 const originalFetch=globalThis.fetch,oldNetlify=globalThis.Netlify;
 try{
  globalThis.Netlify={env:{get:k=>({COMMERCIAL_DIRECT_FIXTURE:'true',COMMERCIAL_SUPABASE_URL:'https://localqa.supabase.co',COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY:key,COMMERCIAL_ALLOWED_ORIGIN:'https://isolated.example.test'})[k]}};
  globalThis.fetch=(target,opts)=>{assert.ok(target.startsWith('https://localqa.supabase.co/rest/v1/rpc/'));return originalFetch(target.replace('https://localqa.supabase.co/rest/v1',url),opts);};
  const {default:handler}=await import(pathToFileURL(bundle).href);
  const id=randomUUID(),data={request_id:id,profile:'atacado',intent:'envio',email:'packaged-qa@example.test',origin:{entry_path:'/',page_path:'/atacado/',utm_source:'instagram'},privacy_ack:true};
  const req=body=>new Request('https://isolated.example.test/api/commercial/lead',{method:'POST',headers:{origin:'https://isolated.example.test','content-type':'application/json'},body:JSON.stringify(body)});
  const first=await handler(req(data)),firstBody=await first.json();assert.equal(first.status,201);assert.equal(firstBody.saved,true);
  const second=await handler(req(data)),secondBody=await second.json();assert.equal(second.status,200);assert.equal(secondBody.duplicate,true);assert.equal(secondBody.receipt,firstBody.receipt);
  assert.equal((await handler(req({...data,intent:'suporte'}))).status,409);
  assert.equal((await originalFetch(url+'/commercial_requests')).status,401);
  const rows=await(await originalFetch(url+'/commercial_requests?request_id=eq.'+id+'&select=receipt,profile,intent,origin,crm_status',{headers:{Authorization:'Bearer '+key}})).json();
  assert.equal(rows.length,1);assert.equal(rows[0].receipt,firstBody.receipt);assert.equal(rows[0].intent,'envio');assert.equal(rows[0].crm_status,'pending');assert.deepEqual(rows[0].origin,data.origin);
 }finally{globalThis.fetch=originalFetch;globalThis.Netlify=oldNetlify;}
});
