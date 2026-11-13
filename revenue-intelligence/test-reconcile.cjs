const {test}=require('node:test');const assert=require('node:assert/strict');const {randomUUID}=require('node:crypto');const {reconcile}=require('./reconcile.js');const ref='LR-'+randomUUID().toUpperCase();const ev=(type,id,more={})=>({event_id:id,reference:ref,type,occurred_at:new Date(1700000000000+Number(id)*1000).toISOString(),...more});
test('deduplicates event ids',()=>{const e=ev('whatsapp_open_click','1');const r=reconcile([e,e]);assert.equal(r.opportunities[0].events,1);assert.equal(r.rejected_count,1);});
test('click is not a confirmed conversation',()=>{const r=reconcile([ev('whatsapp_open_click','1')]);assert.equal(r.opportunities[0].confirmed_conversation,false);});
test('unverified outcome is rejected',()=>{const r=reconcile([ev('conversation_confirmed','1')]);assert.equal(r.rejected_count,1);});
test('valid commercial sequence counts verified sale',()=>{const proof={evidence_verified:true,evidence_id:'sha256-proof'};const r=reconcile([ev('whatsapp_open_click','1'),ev('conversation_confirmed','2',proof),ev('lead_qualified','3',proof),ev('sale_confirmed','4',{...proof,amount:250,currency:'BRL'})]);assert.equal(r.opportunities[0].stage,'won');assert.equal(r.opportunities[0].amount_brl,250);});
test('sale without qualification rejected',()=>{const r=reconcile([ev('sale_confirmed','1',{evidence_verified:true,evidence_id:'proof',amount:99,currency:'BRL'})]);assert.equal(r.rejected_count,1);});
test('invalid references are rejected',()=>{const r=reconcile([ev('whatsapp_open_click','1',{reference:'LR-FAKE'})]);assert.equal(r.opportunities.length,0);});
test('does not mutate input',()=>{const x=[ev('whatsapp_open_click','1')];reconcile(x);assert.equal(x.length,1);});

test('qualification without verified conversation is rejected',()=>{const r=reconcile([ev('lead_qualified','1',{evidence_verified:true,evidence_id:'proof'})]);assert.equal(r.rejected_count,1);});
test('conversation without prior click is rejected',()=>{const r=reconcile([ev('conversation_confirmed','1',{evidence_verified:true,evidence_id:'proof'})]);assert.equal(r.rejected_count,1);});
test('proposal cannot skip qualification',()=>{const r=reconcile([ev('whatsapp_open_click','1'),ev('proposal_created','2',{evidence_verified:true,evidence_id:'proof'})]);assert.equal(r.rejected_count,1);});
