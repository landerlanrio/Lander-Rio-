'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const site = path.resolve(__dirname, '../site');
const script = readFileSync(path.join(site, 'assets/commercial-request.js'), 'utf8');
const originKey = 'lr_commercial_origin_v1';
const requestKey = 'lr_commercial_request_id_varejo';
const freshId = 'd9428888-122b-4dac-b544-4735d12fd496';

function visit(url, entries = new Map()) {
  const { pathname, search } = new URL(url, 'https://landerrio.com.br');
  const html = readFileSync(path.join(site, pathname, 'index.html'), 'utf8');
  const form = {
    dataset: { profile: 'varejo' },
    querySelector: () => ({}),
    addEventListener() {},
    closest: () => ({ querySelector: () => ({}) }),
    hidden: true
  };
  if (html.includes('src="/assets/commercial-request.js"')) {
    vm.runInNewContext(script, {
      location: { pathname, search }, URLSearchParams,
      crypto: { randomUUID: () => freshId },
      sessionStorage: {
        getItem: key => entries.get(key) ?? null,
        setItem: (key, value) => entries.set(key, value)
      },
      document: { querySelectorAll: () => html.includes('data-commercial-request data-profile=') ? [form] : [] }
    });
  }
  return { form, entries };
}

for (const entry of ['/contato/', '/marcas/']) {
  test('keeps allowed campaign on the route from ' + entry + ' to retail', () => {
    const { entries } = visit(entry + '?utm_source=ig&utm_campaign=lr-261125&untracked=discard');
    visit('/varejo/', entries);
    assert.deepEqual(JSON.parse(entries.get(originKey)), {
      entry_path: entry, page_path: '/varejo/', utm_source: 'instagram', utm_campaign: 'lr-261125'
    });
  });
}

test('a JSON null in saved attribution allows the form to open', () => {
  const entries = new Map([[originKey, 'null']]);
  const { form } = visit('/varejo/', entries);
  assert.equal(form.hidden, false);
  assert.equal(JSON.parse(entries.get(originKey)).entry_path, '/varejo/');
});

test('replaces an unusable request ID and preserves a valid UUID for retry', () => {
  for (const invalid of ['a'.repeat(36), 'd9428888-122b-1dac-b544-4735d12fd496']) {
    const entries = new Map([[requestKey, invalid]]);
    visit('/varejo/', entries);
    assert.equal(entries.get(requestKey), freshId);
  }
  const original = 'b2a2eedb-3a66-4000-8001-000000000001';
  const entries = new Map([[requestKey, original]]);
  visit('/varejo/', entries);
  assert.equal(entries.get(requestKey), original);
});
