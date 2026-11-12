/* Pure, isolated attribution and funnel reconciliation. No network, PII, or persistence. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LanderRevenueReconciliation=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const STAGES=['prepared','clicked','conversation_confirmed','qualified','proposal','won','lost'];
const EVENT_STAGE={handoff_prepared:'prepared',whatsapp_open_click:'clicked',conversation_confirmed:'conversation_confirmed',lead_qualified:'qualified',proposal_created:'proposal',sale_confirmed:'won',lead_lost:'lost'};
const CONFIRMED=new Set(['conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost']);
function reconcile(rows){
 if(!Array.isArray(rows))throw new TypeError('events must be an array');
 const ids=new Set(),byReference=new Map(),rejected=[];
 const ordered=[...rows].sort((a,b)=>String(a?.occurred_at||'').localeCompare(String(b?.occurred_at||''))||String(a?.event_id||'').localeCompare(String(b?.event_id||'')));
 for(const e of ordered){
  if(!e||typeof e!=='object'||typeof e.event_id!=='string'||!e.event_id||ids.has(e.event_id)){rejected.push('duplicate_or_invalid_id');continue;}
  ids.add(e.event_id);
  if(!/^LR-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(e.reference||'')||!Object.hasOwn(EVENT_STAGE,e.type)||!Number.isFinite(Date.parse(e.occurred_at))){rejected.push('invalid_event');continue;}
  if(CONFIRMED.has(e.type)&&!(e.evidence_verified===true&&typeof e.evidence_id==='string'&&e.evidence_id.trim())){rejected.push('unverified_outcome');continue;}
  if(e.type==='sale_confirmed'&&!(Number.isFinite(e.amount)&&e.amount>=0&&e.currency==='BRL')){rejected.push('invalid_sale');continue;}
  let row=byReference.get(e.reference);
  if(!row){row={reference:e.reference,stage:'prepared',events:0,amount_brl:0,confirmed_conversation:false};byReference.set(e.reference,row);}
  const next=EVENT_STAGE[e.type],old=STAGES.indexOf(row.stage),incoming=STAGES.indexOf(next);
  if((row.stage==='won'||row.stage==='lost')&&next!==row.stage){rejected.push('terminal_transition');continue;}
  if(incoming<old&&next!=='prepared'){rejected.push('stage_regression');continue;}
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
