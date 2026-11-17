const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('browser evidence identifies the loaded release and starts fresh on retry', async () => {
  const reports = [];
  const nodes = {};
  let run;
  const document = {
    querySelector(selector) {
      return nodes[selector] ||= { addEventListener: (_, callback) => { run = callback; } };
    }
  };
  const version = JSON.parse(fs.readFileSync(path.join(__dirname, '../site/release.json'))).version;
  const fetch = async (url, options) => {
    if (url === '/release.json') return { ok: true, json: async () => ({ version }) };
    if (url === '/__qa/result') { reports.push(JSON.parse(options.body)); return { ok: true }; }
    throw Error('Deliberate missing route manifest');
  };
  const code = fs.readFileSync(path.join(__dirname, 'browser-qa/runner.js'), 'utf8');
  vm.runInNewContext(code, { document, fetch, navigator: { userAgent: 'isolated-test' } });
  await run();
  await run();
  assert.equal(reports.length, 2);
  assert.equal(reports[1].release, version);
  assert.equal(reports[1].status, 'FAIL');
  assert.equal(reports[1].results.length, 1);
});
