import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { join } from 'node:path';

const root = process.argv[2] || 'site';
const baseline = process.argv.includes('--baseline');
const elements = new Map();
const requests = [];
const saved = new Map();
let response;
const document = { querySelector: element, querySelectorAll: () => [], activeElement: null };
function element(selector) {
  if (!elements.has(selector)) {
    const handlers = new Map();
    elements.set(selector, {
      value: '', checked: false, hidden: false, attributes: new Map(),
      addEventListener: (type, callback) => handlers.set(type, callback),
      dispatch: type => handlers.get(type)({preventDefault() {}}),
      checkValidity: () => true,
      setAttribute(name, value) { this.attributes.set(name, value); },
      removeAttribute(name) { this.attributes.delete(name); },
      querySelectorAll: () => [],
      focus() { document.activeElement = this; }
    });
  }
  return elements.get(selector);
}
const webStorage = {
  getItem: key => saved.get(key) ?? null,
  setItem: (key, value) => saved.set(key, value)
};
element('#training-lead-name').value = 'Teste Local';
element('#training-lead-whatsapp').value = '21999990000';
const email = element('#training-lead-email');
const form = element('#training-lead-form');
const feedback = element('#lead-feedback');
const submit = () => form.dispatch('submit');
form.elements = {consent_access: {checked:true}, consent_marketing: {checked:false}, company: {value:''}};
const context = {
  document,
  window: { LanderTrainingEngine: {} },
  location: { pathname: '/treino/' },
  localStorage: webStorage,
  AbortController, setTimeout, clearTimeout,
  async fetch(path, options) {
    assert.equal(path, '/api/workout/lead');
    requests.push(JSON.parse(options.body));
    if (response instanceof Error) throw response;
    return response;
  }
};
runInNewContext(readFileSync(join(root, 'assets/training-v21.js'), 'utf8'), context);
const refused = {ok: false, status: 400};
response = refused;
// HTML type=email accepts a single-label domain. The workout endpoint requires a dot.
email.value = 'a@b';
await submit();
if (baseline) {
  assert.equal(requests.length, 1);
  assert.match(feedback.textContent, /Verifique a conexão/);
  console.log('BASELINE: HTTP 400 with single-label email wrongly shows connectivity guidance.');
} else {
  assert.equal(requests.length, 0);
  assert.equal(document.activeElement, email);
  assert.match(feedback.textContent, /e-mail válido/);
  console.log('PASS 1: single-label domain is rejected client-side with focus on email.');
  email.value = 'usuario@example.test';
  await submit();
  assert.match(feedback.textContent, /Revise o e-mail e o WhatsApp/);
  assert.equal(email.value, 'usuario@example.test');
  assert.equal(element('#training-lead-whatsapp').value, '21999990000');
  assert.equal(saved.size, 0);
  console.log('PASS 2: HTTP 400 names the contact fields, preserves values, and does not grant access.');
  response = Error('network offline');
  await submit();
  assert.match(feedback.textContent, /Verifique a conexão/);
  assert.equal(element('#gate-unlock').disabled, false);
  console.log('PASS 3: network failure has distinct guidance and enables retry.');
  response = {ok: true, json: async () => ({ok:true})};
  await submit();
  assert.equal(saved.size, 0);
  console.log('PASS 4: a response without a valid receipt cannot unlock access.');
  response = {ok:true, json:async()=>({ok:true,id:'88888888-8888-4888-8888-888888888888'})};
  await submit();
  assert.equal(saved.size, 1);
  assert.equal(requests.length, 4);
  assert.equal(requests[3].email, 'usuario@example.test');
  console.log('PASS 5: a valid receipt grants access after retry.');
  const markup = readFileSync(join(root, 'treino/index.html'), 'utf8');
  const planner = markup.match(/<form\b[^>]*\bid="training-form"[^>]*>/)?.[0] || '';
  assert.match(planner, /\bhidden\b/);
  assert.match(planner, /\bmethod="dialog"/);
  assert.equal(element('#training-form').hidden, false);
  assert.equal(element('#planner-unavailable').hidden, true);
  console.log('PASS 6: the profile form is local-only and appears after the handler loads.');
}
