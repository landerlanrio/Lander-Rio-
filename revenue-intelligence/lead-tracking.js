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
function event(input){
 assert(input&&typeof input==='object','event required');
 assert(TYPES.includes(input.type),'unknown event');
 assert(/^LR-[0-9A-F-]{36}$/.test(input.reference||''),'invalid reference');
 assert(input.consent===true,'consent required');
 const confirmed=['conversation_confirmed','lead_qualified','proposal_created','sale_confirmed','lead_lost'].includes(input.type);
 if(confirmed)assert(input.evidence_verified===true&&typeof input.evidence_id==='string'&&input.evidence_id.length>0,'verified evidence required');
 if(input.type==='sale_confirmed')assert(Number.isFinite(input.amount)&&input.amount>=0&&input.currency==='BRL','verified sale amount in BRL required');
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
 if(next==='won')assert(current==='proposal'||current==='qualified','sale requires qualification');
 return next;
}
return Object.freeze({TYPES,STAGES,reference,prepare,event,transition});
});
