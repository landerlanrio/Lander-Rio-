import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEvidence, summarizeEvidence, sanitizeBrowserEvent, evaluateSeoCandidate, CONTRACT_VERSION} from './growth-core.mjs';
const b = (event, eventId='browser:001') => ({event, source:'browser',eventId,consent:true});
const v = (event,source,eventId) => ({event,source,eventId,verified:true});
test('version and browser consent requirement',()=>{
  assert.match(CONTRACT_VERSION, /staging/);
  assert.equal(sanitizeBrowserEvent('whatsapp_open_click',false),null);
  assert.deepEqual(sanitizeBrowserEvent('whatsapp_open_click',true),{event:'whatsapp_open_click',source:'browser'});
  assert.equal(sanitizeBrowserEvent('generate_lead',true),null);
  assert.equal(validateEvidence({...b('site_visit'),consent:false}),null);
});
test('clicks cannot create confirmed contacts, sales or qualified leads',()=>{
  assert.equal(validateEvidence(b('contact_confirmed')),null);
  assert.equal(validateEvidence(b('lead_qualified')),null);
  assert.equal(validateEvidence(b('purchase_confirmed')),null);
  assert.equal(validateEvidence({...v('contact_confirmed','verified_inbox','inbox:001'),verified:false}),null);
});
test('verified backend and CRM events require separate trusted sources',()=>{
  for(const e of [v('contact_confirmed','verified_inbox','inbox:001'),v('lead_qualified','crm','crm:001'),v('purchase_confirmed','verified_order','order:001')]) assert.ok(validateEvidence(e));
  assert.equal(validateEvidence(v('purchase_confirmed','crm','order:001')),null);
  assert.equal(validateEvidence(v('utility_registration_confirmed','browser','reg:001')),null);
});
test('duplicate event IDs deduplicated without assuming visitor identity',()=>{
  const summary = summarizeEvidence([b('site_visit'),b('site_visit'),b('whatsapp_open_click','browser:002'),v('lead_qualified','crm','crm:001'),v('lead_qualified','crm','crm:001'),b('purchase_confirmed')]);
  assert.equal(summary.visits,1);assert.equal(summary.whatsappAttempts,1);assert.equal(summary.qualifiedLeads,1);
  assert.equal(summary.verifiedPurchases,0);assert.equal(summary.duplicates,2);assert.equal(summary.rejected,1);
  assert.equal(summary.isConversionFunnel,false);
});
test('no arbitrary text, PII, or client side proof used',()=>{
  const event=validateEvidence({...b('site_visit'),email:'private@example.test',body:'sensitive',phone:'000',verified:true});
  assert.equal('email' in event,false);assert.equal('body' in event,false);assert.equal('phone' in event,false);
  assert.equal(validateEvidence({...b('site_visit'),eventId:'private@example.test'}),null);
});
test('SEO needs editorial approval and verifiable numbers',()=>{
  const url='https://landerrio.com.br/marcas/life-peptideos/';
  assert.equal(evaluateSeoCandidate({url,impressions:181,clicks:17,position:4.8,reviewStatus:'pending'}).status,'hold');
  const x=evaluateSeoCandidate({url,impressions:181,clicks:17,position:4.8,reviewStatus:'editorially_approved'});
  assert.equal(x.impressions,181);assert.equal(x.status,'review_candidate');assert.ok(x.opportunity>0);
  assert.equal(evaluateSeoCandidate({url:url+'?utm_source=other',impressions:181,clicks:17,position:4.8,reviewStatus:'editorially_approved'}),null);
  assert.equal(evaluateSeoCandidate({url:'https://evil.test/',impressions:181,clicks:17,position:4.8,reviewStatus:'editorially_approved'}),null);
  assert.equal(evaluateSeoCandidate({url,impressions:5,clicks:10,position:4,reviewStatus:'editorially_approved'}),null);
});
