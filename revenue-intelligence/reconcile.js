/* Pure, isolated attribution and funnel reconciliation. No network, PII, or persistence. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LanderRevenueReconciliation=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const STAGES=['prepared','clicked','conversation_confirmed','qualified','proposal','won','lost'];
const EVENT_STAGE={handoff_prepared:'prepared',whatsapp_open_click:'clicked',conversation_confirmed:'conversation_confirmed',lead_qualified:'qualified',proposal_created:'proposal',sale_confirmed:'won',lead_lost:'lost'};
const CONFIRMED=new Set(['conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost']);
const EVENT_KEYS=new Set(['event_id','reference','type','stage','occurred_at','evidence_verified','evidence_id','amount','currency']);
const ISO_UTC=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const EVIDENCE_ID=/^[A-Za-z0-9:_-]{1,128}$/;
function validSaleAmount(value){return Number.isFinite(value)&&value>0&&value<=999999999999.99&&Number.isSafeInteger(Math.round(value*100))&&Math.round(value*100)/100===value;}
function reconcile(rows){
 if(!Array.isArray(rows))throw new TypeError('events must be an array');
 const ids=new Set(),byReference=new Map(),rejected=[];
 // Preserve input order as the tie-breaker when timestamps are identical.
 const ordered=[...rows].sort((a,b)=>{
  const left=Date.parse(a?.occurred_at||''),right=Date.parse(b?.occurred_at||'');
  if(!Number.isFinite(left))return Number.isFinite(right)?1:0;
  if(!Number.isFinite(right))return -1;
  return left-right;
 });
 for(const e of ordered){
  if(!e||typeof e!=='object'||Array.isArray(e)||typeof e.event_id!=='string'||!e.event_id.trim()||e.event_id.length>128||ids.has(e.event_id)){rejected.push('duplicate_or_invalid_id');continue;}
  if(Object.keys(e).some(key=>!EVENT_KEYS.has(key))){rejected.push('unexpected_event_field');continue;}
  if(!/^LR-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(e.reference||'')||!Object.hasOwn(EVENT_STAGE,e.type)||!ISO_UTC.test(e.occurred_at||'')||!Number.isFinite(Date.parse(e.occurred_at))||(e.stage!==undefined&&e.stage!==EVENT_STAGE[e.type])){rejected.push('invalid_event');continue;}
  const confirmed=CONFIRMED.has(e.type);
  if(confirmed&&!(e.evidence_verified===true&&typeof e.evidence_id==='string'&&EVIDENCE_ID.test(e.evidence_id))){rejected.push('unverified_outcome');continue;}
  if(!confirmed&&(e.evidence_id!==undefined||e.evidence_verified===true)){rejected.push('unexpected_evidence');continue;}
  if(e.type==='sale_confirmed'&&!(validSaleAmount(e.amount)&&e.currency==='BRL')){rejected.push('invalid_sale');continue;}
  if(e.type!=='sale_confirmed'&&(e.amount!==undefined||e.currency!==undefined)){rejected.push('unexpected_amount');continue;}
  // Invalid events must not reserve IDs and block later valid events.
  ids.add(e.event_id);
  let row=byReference.get(e.reference);
  if(!row){row={reference:e.reference,stage:'prepared',events:0,amount_brl:0,confirmed_conversation:false};byReference.set(e.reference,row);}
  const next=EVENT_STAGE[e.type],old=STAGES.indexOf(row.stage),incoming=STAGES.indexOf(next);
  if(row.stage==='won'||row.stage==='lost'){rejected.push('terminal_transition');continue;}
  if(incoming<old){rejected.push('stage_regression');continue;}
  if(next==='prepared'&&row.events>0){rejected.push('duplicate_handoff');continue;}
  if(next==='won'&&old<STAGES.indexOf('qualified')){rejected.push('sale_without_qualification');continue;}
  if(next==='conversation_confirmed'&&row.stage!=='clicked'){rejected.push('conversation_without_click');continue;}
  if(next==='qualified'&&row.stage!=='conversation_confirmed'){rejected.push('qualification_without_conversation');continue;}
  if(next==='proposal'&&row.stage!=='qualified'){rejected.push('proposal_without_qualification');continue;}
  row.stage=next;row.events++;
  if(e.type==='conversation_confirmed')row.confirmed_conversation=true;
  if(e.type==='sale_confirmed')row.amount_brl+=e.amount;
 }
 return {opportunities:[...byReference.values()],rejected_count:rejected.length,rejection_reasons:rejected};
}
return Object.freeze({reconcile});
});
