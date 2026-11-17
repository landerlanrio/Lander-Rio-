const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function page(search, consent = 'granted', pathname = '/') {
  const memory = (initial = {}) => {
    const values = new Map(Object.entries(initial));
    return {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key)
    };
  };
  const listeners = new Map();
  const window = {
    localStorage: memory({ lr_measurement_consent_v20: consent }),
    sessionStorage: memory(),
    addEventListener(name, listener) {
      const current = listeners.get(name) || [];
      current.push(listener);
      listeners.set(name, current);
    },
    dispatchEvent(event) {
      for (const listener of listeners.get(event.type) || []) listener(event);
    }
  };
  const document = {
    body: { dataset: {} }, head: { appendChild() {} },
    createElement: () => ({}), querySelector: () => null, addEventListener() {}
  };
  const context = vm.createContext({
    window, document, location: { hostname: 'landerrio.com.br', pathname, search },
    URLSearchParams, crypto: { randomUUID: () => 'local-qa' },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    fetch: async () => ({ ok: true })
  });
  for (const script of ['measurement-v23-2.js', 'ga4-config.js', 'ga4-intent.js']) {
    const filename = path.join(__dirname, '..', 'site', 'assets', script);
    vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
  }
  const calls = (type, action) => (window.dataLayer || []).filter(
    item => item[0] === type && (!action || item[1] === action)
  );
  return { window, calls };
}

test('landing uses approved campaign values with a clean page URL', () => {
  const p = page('?utm_source=ig&utm_medium=social&utm_campaign=lr-261117&utm_content=link_in_bio&private=discard');
  const config = p.calls('config')[0][2];
  assert.equal(config.campaign_source, 'instagram');
  assert.equal(config.campaign_medium, 'social');
  assert.equal(config.campaign_name, 'lr-261117');
  assert.equal(config.campaign_content, 'bio');
  assert.equal(config.page_location, 'https://landerrio.com.br/');
  assert.equal(config.page_referrer, '');
  assert.equal(p.calls('event', 'page_view').length, 1);
  assert.doesNotMatch(JSON.stringify(p.window.dataLayer), /discard|link_in_bio/);
});

test('partial or invalid campaigns do not override acquisition', () => {
  for (const q of ['', '?utm_source=ig', '?utm_source=unknown&utm_medium=social', '?private=discard']) {
    const config = page(q).calls('config')[0][2];
    assert.deepEqual(Object.keys(config).filter(k => k.startsWith('campaign_')), []);
  }
  const clean = page('?utm_source=ig&utm_medium=social&utm_campaign=private&utm_content=unknown').calls('config')[0][2];
  assert.equal(clean.campaign_source, 'instagram');
  assert.equal(clean.campaign_name, undefined);
  assert.equal(clean.campaign_content, undefined);
});

test('the two public models keep distinct action values and never create a lead', () => {
  const p = page('');
  for (const action of ['download-diario-de-treino-csv', 'download-lista-de-compras-semanal-csv']) {
    p.window.LanderMeasurement.push('cta_interaction', { action });
    assert.equal(p.calls('event', 'cta_interaction').at(-1)[2].action, action);
  }
  p.window.LanderMeasurement.push('cta_interaction', { action: 'unlisted-action' });
  assert.equal(p.calls('event', 'cta_interaction').at(-1)[2].action, undefined);
  assert.equal(p.calls('event', 'generate_lead').length, 0);
});

test('opt-out and excluded pages keep Google Analytics off', () => {
  for (const p of [page('?utm_source=ig&utm_medium=social', 'denied'),
                    page('?utm_source=ig&utm_medium=social', 'granted', '/enciclopedia/')]) {
    assert.equal(p.calls('config').length, 0);
    assert.equal(p.calls('event').length, 0);
  }
});
