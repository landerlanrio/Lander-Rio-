/* LANDER RIO — Revenue Intelligence phase 1. Opt-in, no network calls or PII. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LanderRevenueIntelligence=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TYPES=Object.freeze(['handoff_prepared','whatsapp_open_click','conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost']);
const STAGES=Object.freeze(['prepared','clicked','conversation_confirmed','qualified','proposal','won','lost']);
const MAP={handoff_prepared:'prepared',whatsapp_open_click:'clicked',conversation_confirmed:'conversation_confirmed',lead_qualified:'qualified',proposal_created:'proposal',sale_confirmed:'won',lead_lost:'lost'};
const CHANNELS=['instagram','whatsapp','google','facebook','tiktok','direct','referral','unknown'];
const SEGMENTS=['atacado','varejo','geral'];
function assert(v,msg){if(!v)throw Error(msg);}
function reference(randomUUID){assert(typeof randomUUID==='function','secure randomUUID required');const id=randomUUID();assert(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),'invalid uuid v4');return 'LR-'+id.toUpperCase();}
function normalize(value,allowed,fallback){return allowed.includes(value)?value:fallback;}
function prepare(input,randomUUID){
 assert(input&&typeof input==='object','input required');
 assert(input.consent===true,'explicit measurement consent required');
 const ref=reference(randomUUID);
 return Object.freeze({reference:ref,segment:normalize(input.segment,SEGMENTS,'geral'),source:normalize(input.source,CHANNELS,'unknown'),placement:typeof input.placement==='string'&&/^[a-z0-9_-]{1,40}$/.test(input.placement)?input.placement:'unknown',created_at:new Date().toISOString()});
}
function validSaleAmount(value){return Number.isFinite(value)&&value>0&&value<=999999999999.99&&Number.isSafeInteger(Math.round(value*100))&&Math.round(value*100)/100===value;}
function event(input){
 assert(input&&typeof input==='object','event required');
 assert(TYPES.includes(input.type),'unknown event');
 assert(/^LR-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(input.reference||''),'invalid reference');
 assert(input.consent===true,'consent required');
 const confirmed=['conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost'].includes(input.type);
 if(confirmed)assert(input.evidence_verified===true&&typeof input.evidence_id==='string'&&/^[A-Za-z0-9:_-]{1,128}$/.test(input.evidence_id),'verified evidence required');
 if(input.type==='sale_confirmed')assert(validSaleAmount(input.amount)&&input.currency==='BRL','verified sale amount in BRL required');
 const result={event_id:reference(input.randomUUID),reference:input.reference,type:input.type,stage:MAP[input.type],occurred_at:new Date().toISOString(),evidence_verified:confirmed};
 if(confirmed)result.evidence_id=input.evidence_id;
 if(input.type==='sale_confirmed'){result.amount=input.amount;result.currency='BRL';}
 return Object.freeze(result);
}
function transition(current,type){
 assert(STAGES.includes(current),'unknown stage');assert(TYPES.includes(type),'unknown event');
 const next=MAP[type],rank={prepared:0,clicked:1,conversation_confirmed:2,qualified:3,proposal:4,won:5,lost:5};
 assert(current!=='won'&&current!=='lost','terminal stage');
 assert(rank[next]>=rank[current],'stage regression');
 assert(!(next===current&&['conversation_confirmed','qualified','proposal'].includes(next)),'duplicate transition');
 if(next==='won')assert(current==='proposal'||current==='qualified','sale requires qualification');
 if(next==='conversation_confirmed')assert(current==='clicked','conversation requires prior click');
 if(next==='qualified')assert(current==='conversation_confirmed','qualification requires verified conversation');
 if(next==='proposal')assert(current==='qualified','proposal requires qualification');
 return next;
}
return Object.freeze({TYPES,STAGES,reference,prepare,event,transition});
});
