'use strict';
// Server-to-server boundary. Not mounted, not deployed. No default credentials.
// Caller must supply durable transactional store + independent evidence lookup.
const {createHmac,timingSafeEqual}=require('node:crypto');
function createHandler({secret,store,verifyEvidence,now=Date.now}={}){
 const response=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
 return async function handle(request){
  if(typeof secret!=='string'||secret.length<32||!store||typeof store.submit!=='function'||typeof verifyEvidence!=='function')return response(503,{error:'not_configured'});
  if(request.method!=='POST')return response(405,{error:'method_not_allowed'});
  // Browser data cannot use this privileged endpoint, even with forged claims.
  if(request.headers.has('origin'))return response(403,{error:'server_only'});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return response(415,{error:'json_required'});
  const {readBoundedBody}=await import('../prototypes/rox-ai-v2/http-guards.mjs');
  let body;try{body=await readBoundedBody(request,8000)}catch{return response(413,{error:'body_rejected'})}
  const timestamp=request.headers.get('x-lr-timestamp'),signature=request.headers.get('x-lr-signature'),key=request.headers.get('idempotency-key');
  if(!/^\d{13}$/.test(timestamp||'')||Math.abs(now()-Number(timestamp))>300000||!/^sha256=[a-f0-9]{64}$/.test(signature||'')||!/^[A-Za-z0-9_-]{12,96}$/.test(key||''))return response(401,{error:'invalid_authentication'});
  const expected=createHmac('sha256',secret).update(timestamp+'.'+key+'.'+body).digest();
  if(!timingSafeEqual(expected,Buffer.from(signature.slice(7),'hex')))return response(401,{error:'invalid_authentication'});
  let input;try{input=JSON.parse(body)}catch{return response(400,{error:'invalid_json'})}
  if(!input||Object.keys(input).some(k=>!['event','evidence_source'].includes(k))||!input.event||typeof input.event!=='object')return response(400,{error:'invalid_payload'});
  // Closed schema prevents accidental PII/transcript logging or propagation.
  const allowed=['event_id','reference','type','stage','occurred_at','evidence_verified','evidence_id','amount','currency'];
  if(Object.keys(input.event).some(k=>!allowed.includes(k)))return response(400,{error:'unexpected_event_fields'});
  const confirmed=!['handoff_prepared','whatsapp_open_click'].includes(input.event.type);
  if(!confirmed)return response(400,{error:'verified_outcomes_only'});
  if(!['whatsapp_verified_webhook','crm_verified_transition','payment_reconciliation'].includes(input.evidence_source))return response(400,{error:'invalid_evidence_source'});
  try{
   // Incoming evidence_verified is never sufficient. Check source independently.
   if(await verifyEvidence(input.evidence_source,input.event)!==true)return response(422,{error:'evidence_not_confirmed'});
   const result=await store.submit({event:{...input.event,evidence_verified:true},idempotency_key:key,actor:'verified_backend'});
   return response(200,{...result});
  }catch{return response(409,{error:'event_rejected'})}
 };
}
module.exports={createHandler};
