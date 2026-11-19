'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const site = path.resolve(__dirname, '..', 'site');
test('legacy /favicon.ico requests use the existing PNG asset', () => {
  const redirects = fs.readFileSync(path.join(site, '_redirects'), 'utf8');
  const rules = redirects.split(/\r?\n/).map(line => line.trim())
    .filter(line => !line.startsWith('#') && line.startsWith('/favicon.ico '));
  assert.deepEqual(rules, ['/favicon.ico /favicon.png 302']);
  const png = fs.readFileSync(path.join(site, 'favicon.png'));
  assert.ok(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
});
