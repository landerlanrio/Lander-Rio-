import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('./baseline.json',import.meta.url),'utf8'));
test('GA4 and Supabase periods are explicit and historical',()=>{
  assert.equal(data.ga4.sessions,81);
  assert.equal(data.ga4.generateLeadEvents,31);
  assert.equal(data.backend.period,'2026-10-20/2026-11-18 America/Sao_Paulo');
  assert.equal(data.period.ga4,'2026-10-20/2026-11-18');
});
test('confirmed backend outcomes exclude OMEGA test traffic',()=>{
  assert.equal(data.backend.omegaTestEvents,39);
  assert.equal(data.backend.omegaProductionEvents,0);
  assert.equal(data.backend.verifiedCommercialOutcomes,0);
  assert.equal(data.backend.workoutRegistrations,3);
  assert.equal(data.backend.nutritionRegistrations,0);
});
test('no personal records are stored in the baseline',()=>{
  const raw=JSON.stringify(data);
  assert.doesNotMatch(raw,/\+55\d{10,11}|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
  assert.ok(data.backend.measurementNotes.some(x=>x.includes('not establish')));
});
test('SEO scoring is never converted into a sales claim',()=>{
 assert.equal(data.gscPages.length,7);
 assert.ok(data.gscPages.every(p=>Number.isInteger(p.impressions)&&Number.isInteger(p.clicks)&&p.clicks<=p.impressions));
 assert.equal(data.ga4.purchaseRevenueBRL,0);
 assert.equal(data.ga4.trackedTransactions,0);
});
