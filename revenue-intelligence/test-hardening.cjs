'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {reconcile}=require('./reconcile.js');
const {createStore}=require('./local-store.js');
const tracking=require('./lead-tracking.js');
const ref='LR-'+randomUUID().toUpperCase();
const evidence={evidence_verified:true,evidence_id:'sha256-proof'};
const origin=Date.parse('2026-11-01T12:00:00.000Z');
const ev=(type,id,extra={},offset=0)=>({event_id:id,reference:ref,type,occurred_at:new Date(origin+offset).toISOString(),...extra});
const sequence=()=>[
 ev('whatsapp_open_click','click'),
 ev('conversation_confirmed','conversation',evidence,1000),
 ev('lead_qualified','qualified',evidence,2000),
 ev('sale_confirmed','sale',{...evidence,amount:149.90,currency:'BRL'},3000)
];
test('later handoff cannot regress a click',()=>{
 const r=reconcile([ev('whatsapp_open_click','click'),ev('handoff_prepared','late',{},1000)]);
 assert.equal(r.rejected_count,1);assert.equal(r.opportunities[0].stage,'clicked');
});
test('repeated handoff without click is rejected',()=>{
 const r=reconcile([ev('handoff_prepared','one'),ev('handoff_prepared','two',{},1000)]);
 assert.equal(r.rejected_count,1);assert.equal(r.opportunities[0].events,1);
});
test('timestamp ties preserve input sequence rather than lexical IDs',()=>{
 const r=reconcile([ev('whatsapp_open_click','z-click'),ev('conversation_confirmed','a-conversation',evidence)]);
 assert.equal(r.rejected_count,0);assert.equal(r.opportunities[0].confirmed_conversation,true);
});
test('distinct events cannot record a sale twice after terminal win',()=>{
 const x=sequence();x.push(ev('sale_confirmed','second',{...evidence,amount:99,currency:'BRL'},4000));
 const r=reconcile(x);assert.equal(r.rejected_count,1);assert.equal(r.opportunities[0].amount_brl,149.90);assert.equal(r.opportunities[0].events,4);
});
test('lost opportunity cannot be modified after terminal state',()=>{
 const r=reconcile([ev('whatsapp_open_click','click'),ev('lead_lost','lost',evidence,1000),ev('lead_lost','another',evidence,2000)]);
 assert.equal(r.rejected_count,1);assert.equal(r.opportunities[0].stage,'lost');
});
test('unexpected personal fields are rejected',()=>{
 for(const field of ['phone','email','message','medical_history']){
  const r=reconcile([ev('whatsapp_open_click','pii',{[field]:'SYNTHETIC-REJECT'})]);
  assert.equal(r.rejected_count,1);assert.equal(r.opportunities.length,0);
 }
});
test('forged stage is rejected',()=>{
 const r=reconcile([ev('whatsapp_open_click','forged',{stage:'won'})]);
 assert.equal(r.rejected_count,1);assert.equal(r.opportunities.length,0);
});
test('invalid timestamps and unexpected amount fields fail closed',()=>{
 assert.equal(reconcile([ev('whatsapp_open_click','a',{occurred_at:'2026-01-01'})]).rejected_count,1);
 assert.equal(reconcile([ev('whatsapp_open_click','a',{amount:100,currency:'BRL'})]).rejected_count,1);
});
test('unverified events cannot carry proof identifiers',()=>{
 assert.equal(reconcile([ev('whatsapp_open_click','a',{evidence_id:'fake-proof'})]).rejected_count,1);
});
test('invalid event cannot reserve ID and poison valid event',()=>{
 const r=reconcile([ev('whatsapp_open_click','reuse',{phone:'SYNTHETIC-REJECT'}),ev('whatsapp_open_click','reuse',{},1000)]);
 assert.equal(r.rejected_count,1);assert.equal(r.opportunities[0].events,1);
});
test('repeated real click is not a confirmed conversation',()=>{
 const r=reconcile([ev('whatsapp_open_click','one'),ev('whatsapp_open_click','two',{},1000)]);
 assert.equal(r.rejected_count,0);assert.equal(r.opportunities[0].events,2);assert.equal(r.opportunities[0].confirmed_conversation,false);
});
test('sale amount must be positive with two decimals and SQL-safe precision',()=>{
 const base={type:'sale_confirmed',reference:ref,consent:true,evidence_verified:true,evidence_id:'safe-proof',currency:'BRL',randomUUID};
 for(const amount of [0,-1,1.001,Infinity,1000000000000])assert.throws(()=>tracking.event({...base,amount}),/amount/);
 assert.equal(tracking.event({...base,amount:0.01}).amount,0.01);
});
test('strict reference and evidence IDs prevent unsafe event fields',()=>{
 assert.throws(()=>tracking.event({type:'whatsapp_open_click',reference:'LR-'+'A'.repeat(36),consent:true,randomUUID}),/reference/);
 assert.throws(()=>tracking.event({type:'conversation_confirmed',reference:ref,consent:true,evidence_verified:true,evidence_id:'person@example.org',randomUUID}),/evidence/);
});
test('terminal and duplicate stage transitions are not possible',()=>{
 assert.throws(()=>tracking.transition('won','sale_confirmed'),/terminal/);
 assert.throws(()=>tracking.transition('clicked','handoff_prepared'),/regression/);
 assert.throws(()=>tracking.transition('qualified','lead_qualified'),/duplicate/);
});
test('visitor cannot supply fake backend verification in local store',()=>{
 const s=createStore();
 assert.throws(()=>s.submit({event:ev('whatsapp_open_click','forge',{evidence_verified:true,evidence_id:'fake-proof'}),actor:'visitor',idempotency_key:'idempotent-00001'}),/visitor/);
 assert.equal(s.snapshot().length,0);
});
test('local store rejects a second verified sale',()=>{
 const s=createStore();
 sequence().forEach((e,i)=>s.submit({event:e,actor:i===0?'visitor':'verified_backend',idempotency_key:'idempotent-0000'+i}));
 assert.throws(()=>s.submit({event:ev('sale_confirmed','again',{...evidence,amount:99,currency:'BRL'},4000),actor:'verified_backend',idempotency_key:'idempotent-00009'}),/terminal_transition/);
 assert.equal(s.snapshot()[0].amount_brl,149.90);
});
test('proposed SQL isolates access and records idempotency',()=>{
 const sql=readFileSync(join(__dirname,'schema.sql'),'utf8');
 assert.match(sql,/DO NOT APPLY TO PRODUCTION/);
 assert.match(sql,/idempotency_key text not null unique/);
 assert.match(sql,/evidence_id_hash text/);
 assert.match(sql,/enable row level security/g);
 assert.match(sql,/revoke all on all tables in schema revenue_intelligence from public, anon, authenticated/);
 assert.match(sql,/revoke all on all sequences in schema revenue_intelligence from public, anon, authenticated/);
});
