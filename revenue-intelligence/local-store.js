/* Local-only transactional simulator. No network or customer data. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LanderRevenueStore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const {reconcile}=typeof require==='function'?require('./reconcile.js'):globalThis.LanderRevenueReconciliation;
function createStore(){
 const opportunities=new Map(),events=new Map(),keys=new Map();
 function submit(input){
  if(!input||typeof input!=='object')throw Error('invalid payload');
  const {event,idempotency_key,actor}=input;
  if(!/^[a-zA-Z0-9_-]{12,96}$/.test(idempotency_key||''))throw Error('invalid idempotency key');
  if(!['visitor','verified_backend'].includes(actor))throw Error('unauthorized actor');
  if(!event||typeof event!=='object')throw Error('missing event');
  if(actor==='visitor'&&!['handoff_prepared','whatsapp_open_click'].includes(event.type))throw Error('backend verification required');
  if(actor==='verified_backend'&&!event.evidence_verified)throw Error('verified evidence required');
  const fingerprint=JSON.stringify(event);
  if(keys.has(idempotency_key)){
   const previous=keys.get(idempotency_key);
   if(previous.fingerprint!==fingerprint)throw Error('idempotency conflict');
   return Object.freeze({...previous.result,deduplicated:true});
  }
  if(events.has(event.event_id))throw Error('duplicate event id');
  const prior=opportunities.get(event.reference)||[];
  const result=reconcile([...prior,event]);
  if(result.rejected_count)throw Error('invalid funnel transition: '+result.rejection_reasons.join(','));
  const updated=result.opportunities.find(x=>x.reference===event.reference);
  if(!updated)throw Error('missing opportunity');
  opportunities.set(event.reference,[...prior,event]);
  events.set(event.event_id,event);
  const response=Object.freeze({reference:event.reference,stage:updated.stage,event_count:updated.events,amount_brl:updated.amount_brl,deduplicated:false});
  keys.set(idempotency_key,{fingerprint,result:response});
  return response;
 }
 function snapshot(){return [...opportunities].map(([reference,rows])=>({reference,...reconcile(rows).opportunities[0]}));}
 return Object.freeze({submit,snapshot});
}
return Object.freeze({createStore});
});
