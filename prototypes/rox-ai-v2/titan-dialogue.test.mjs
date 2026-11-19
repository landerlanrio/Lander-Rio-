import {test} from 'node:test';
import assert from 'node:assert/strict';
import {agentTurnV3,buildHumanHandoff} from './agent-v3.mjs';
test('informal Portuguese, typo and quantity qualify without promises',()=>{
 const r=agentTurnV3({message:'qro atacdo 20 unidades'});assert.equal(r.mode,'handoff');assert.equal(r.qualification.segment,'atacado');assert.equal(r.qualification.quantity,20);assert(r.integrations.whatsapp.message.includes('20 unidades'));assert.equal(r.integrations.whatsapp.sent,false);
});
test('safe allowlisted context retains segment, topic and quantity across turns',()=>{
 const r=agentTurnV3({message:'quero catlogo',history:[{role:'user',content:'atacado 20 unidades'}]});assert.equal(r.qualification.topic_id,'catalogo');assert.equal(r.qualification.quantity,20);assert.equal(r.qualification.segment,'atacado');
});
test('basic arithmetic is bounded and never evaluates code',()=>{assert.match(agentTurnV3({message:'quanto é 8 + 4'}).reply,/12/);assert.match(agentTurnV3({message:'4 / 0'}).reply,/zero/);assert.equal(agentTurnV3({message:'1; fetch("https://other.test")'}).mode,'unknown')});
test('simple general information and greetings do not become sales leads',()=>{for(const message of ['oi','obg','qual a capital do Brasil?']){const r=agentTurnV3({message});assert.equal(r.mode,'offline');assert.equal(r.integrations,undefined)}});
test('draft never trusts an arbitrary raw quantity or topic',()=>{const r=buildHumanHandoff({segment:'unknown',quantity:'CPF 12345678909',topicId:'private'});assert(!r.includes('12345678909'));assert(!r.includes('private'))});
