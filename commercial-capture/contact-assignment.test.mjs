import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createAssignmentReader, reconcileAndCheckAssignment } from './contact-assignment.mjs';
import { normalize } from './core.mjs';
import { createHubSpotCRM } from './reconcile.mjs';
import { SQLiteStore } from './sqlite-store.mjs';

const requestId = '00000000-0000-4000-8000-000000000001';
const receipt = 'LR-' + requestId.replaceAll('-', '');
const config = { supabaseUrl: 'https://fixture.supabase.co', supabaseKey: 'queue-fixture', hubspotToken: 'crm-fixture' };
const linked = [{ crm_status: 'synced', crm_contact_id: '123' }];
const contact = { id: '123', archived: false, properties: { hubspot_owner_id: '77' } };

function scenario({ rows = linked, body = contact, queueCode = 200, crmCode = 200, failure } = {}) {
  const calls = [];
  const read = createAssignmentReader({ ...config, fetchImpl: async (url, options) => {
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    calls.push(url.href);
    if (url.origin === config.supabaseUrl) {
      assert.equal(url.pathname, '/rest/v1/commercial_requests');
      assert.equal(url.searchParams.get('receipt'), 'eq.' + receipt);
      assert.equal(url.searchParams.get('select'), 'crm_status,crm_contact_id');
      assert.equal(options.headers.Authorization, 'Bearer ' + config.supabaseKey);
      if (failure === 'queue') throw Error('simulated timeout');
      return Response.json(rows, { status: queueCode });
    }
    assert.equal(url.origin, 'https://api.hubapi.com');
    assert.equal(url.pathname, '/crm/v3/objects/contacts/123');
    assert.equal(url.searchParams.get('properties'), 'hubspot_owner_id');
    assert.equal(options.headers.Authorization, 'Bearer ' + config.hubspotToken);
    if (failure === 'crm') throw Error('simulated timeout');
    if (failure === 'bad_json') return new Response('{');
    return Response.json(body, { status: crmCode });
  }});
  return { read, calls };
}

for (const [title, fixture, expected, calls] of [
  ['assigned owner', {}, 'assigned', 2],
  ['explicit blank value', { body: { ...contact, properties: { hubspot_owner_id: '' } } }, 'unassigned', 2],
  ['explicit null value', { body: { ...contact, properties: { hubspot_owner_id: null } } }, 'unassigned', 2],
  ['field omitted', { body: { ...contact, properties: {} } }, 'contact_unverified', 2],
  ['malformed owner', { body: { ...contact, properties: { hubspot_owner_id: ' ' } } }, 'contact_unverified', 2],
  ['wrong contact', { body: { ...contact, id: '456' } }, 'contact_unverified', 2],
  ['archived contact', { body: { ...contact, archived: true } }, 'contact_unverified', 2],
  ['CRM read forbidden', { crmCode: 403 }, 'crm_access_denied', 2],
  ['CRM token rejected', { crmCode: 401 }, 'crm_access_denied', 2],
  ['missing contact', { crmCode: 404 }, 'contact_unverified', 2],
  ['rate-limited CRM', { crmCode: 429 }, 'contact_unverified', 2],
  ['CRM timeout', { failure: 'crm' }, 'contact_unverified', 2],
  ['malformed response', { failure: 'bad_json' }, 'contact_unverified', 2],
  ['missing receipt', { rows: [] }, 'receipt_not_found', 1],
  ['duplicate receipt results', { rows: [...linked, ...linked] }, 'queue_unavailable', 1],
  ['unlinked receipt', { rows: [{ crm_status: 'pending', crm_contact_id: null }] }, 'contact_not_linked', 1],
  ['queue read forbidden', { queueCode: 403 }, 'queue_access_denied', 1],
  ['queue timeout', { failure: 'queue' }, 'queue_unavailable', 1],
  ['unusable contact ID', { rows: [{ crm_status: 'synced', crm_contact_id: 'bad' }] }, 'contact_unverified', 1],
]) {
  test(title, async () => {
    const fixtureRunner = scenario(fixture);
    assert.equal(await fixtureRunner.read(receipt), expected);
    assert.equal(fixtureRunner.calls.length, calls);
  });
}

test('invalid receipt stops before either data source', async () => {
  const fixture = scenario();
  await assert.rejects(fixture.read('invalid-receipt'), /invalid_receipt/);
  assert.equal(fixture.calls.length, 0);
});

test('recheck after permission failure and later assignment uses the saved link exactly once', async () => {
  const store = new SQLiteStore(':memory:');
  try {
    const record = normalize({ request_id: requestId, profile: 'varejo', intent: 'consulta',
      email: 'checkout@example.test', privacy_ack: true });
    const saved = await store.save(record);
    const operations = [];
    let owner = null;
    let permission = false;
    const fetchImpl = async (url, options) => {
      const target = new URL(url);
      operations.push(options.method);
      if (target.origin === config.supabaseUrl) {
        assert.equal(options.method, 'GET');
        const row = store.list().find(entry => entry.receipt === saved.receipt);
        return Response.json([{ crm_status: row.crm_status, crm_contact_id: row.crm_contact_id }]);
      }
      if (options.method === 'POST') {
        assert.equal(target.pathname, '/crm/v3/objects/contacts/batch/upsert');
        assert.deepEqual(JSON.parse(options.body).inputs[0].properties, { email: record.email });
        return Response.json({ results: [{ id: '123' }] });
      }
      assert.equal(options.method, 'GET');
      assert.equal(target.pathname, '/crm/v3/objects/contacts/123');
      if (!permission) return Response.json({}, { status: 403 });
      return Response.json({ ...contact, properties: { hubspot_owner_id: owner } });
    };
    const readAssignment = createAssignmentReader({ ...config, fetchImpl });
    const crm = createHubSpotCRM({ token: config.hubspotToken, fetchImpl });
    const first = await reconcileAndCheckAssignment({ store, crm, readAssignment });
    assert.deepEqual(first, { status: 'synced', request_id: requestId, assignment_status: 'crm_access_denied' });
    const stored = store.list();
    permission = true;
    assert.equal(await readAssignment(saved.receipt), 'unassigned');
    owner = '77';
    assert.equal(await readAssignment(saved.receipt), 'assigned');
    assert.equal(await readAssignment(saved.receipt), 'assigned');
    assert.deepEqual(await reconcileAndCheckAssignment({ store, crm, readAssignment }), { status: 'empty' });
    assert.deepEqual(store.list(), stored);
    assert.deepEqual(operations, ['POST', ...Array(8).fill('GET')]);
  } finally {
    store.close();
  }
});

test('CLI keeps writes gated and allows receipt-only reads when sync is off', () => {
  const cli = fileURLToPath(new URL('./operator.mjs', import.meta.url));
  const env = {
    COMMERCIAL_CRM_SYNC_ENABLED: 'false', COMMERCIAL_SUPABASE_URL: config.supabaseUrl,
    COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY: config.supabaseKey, HUBSPOT_PRIVATE_APP_TOKEN: config.hubspotToken,
  };
  const preload = `globalThis.fetch = async (url, options) => {
    if (options.method !== 'GET' || new URL(url).hostname !== 'fixture.supabase.co') throw Error('unexpected request');
    return Response.json([]);
  }`;
  const execute = (...args) => spawnSync(process.execPath, [
    '--import', 'data:text/javascript,' + encodeURIComponent(preload), cli, ...args
  ], { env, encoding: 'utf8' });
  const verify = execute('verify-assignment', receipt);
  assert.equal(verify.status, 0);
  assert.deepEqual(JSON.parse(verify.stdout), { assignment_status: 'receipt_not_found' });
  const apply = execute('reconcile-one', '--apply');
  assert.notEqual(apply.status, 0);
  assert.match(apply.stderr, /CRM sync is disabled/);
});
