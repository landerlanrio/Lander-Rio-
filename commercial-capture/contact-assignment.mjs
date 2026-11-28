// Run only on the server. The existing queue status describes contact persistence.
import { reconcileOne } from './reconcile.mjs';

const validReceipt = /^LR-[A-F0-9]{32}$/;
const positiveId = /^[1-9][0-9]*$/;

export function createAssignmentReader({ supabaseUrl, supabaseKey, hubspotToken, fetchImpl = fetch }) {
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(supabaseUrl || '') || !supabaseKey || !hubspotToken) {
    throw Error('assignment_reader_not_configured');
  }

  return async function readAssignment(receipt) {
    if (!validReceipt.test(receipt)) throw Error('invalid_receipt');
    const lookup = new URL('/rest/v1/commercial_requests', supabaseUrl);
    lookup.search = new URLSearchParams({
      receipt: 'eq.' + receipt,
      select: 'crm_status,crm_contact_id',
      limit: '2'
    }).toString();

    let rows;
    try {
      const response = await fetchImpl(lookup, {
        method: 'GET', redirect: 'error', signal: AbortSignal.timeout(8000),
        headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey }
      });
      if (response.status === 401 || response.status === 403) return 'queue_access_denied';
      if (!response.ok) return 'queue_unavailable';
      rows = await response.json();
    } catch {
      return 'queue_unavailable';
    }
    if (!Array.isArray(rows) || rows.length > 1) return 'queue_unavailable';
    if (rows.length === 0) return 'receipt_not_found';
    const row = rows[0];
    if (!row || typeof row !== 'object') return 'queue_unavailable';
    if (row.crm_status !== 'synced' || !row.crm_contact_id) return 'contact_not_linked';
    const id = row.crm_contact_id;
    if (typeof id !== 'string' || !positiveId.test(id)) return 'contact_unverified';

    const target = new URL('/crm/v3/objects/contacts/' + id, 'https://api.hubapi.com');
    target.searchParams.set('properties', 'hubspot_owner_id');
    try {
      const response = await fetchImpl(target, {
        method: 'GET', redirect: 'error', signal: AbortSignal.timeout(8000),
        headers: { Authorization: 'Bearer ' + hubspotToken }
      });
      if (response.status === 401 || response.status === 403) return 'crm_access_denied';
      if (!response.ok) return 'contact_unverified';
      const contact = await response.json();
      if (contact.id !== id || contact.archived !== false ||
          !contact.properties || !Object.hasOwn(contact.properties, 'hubspot_owner_id')) {
        return 'contact_unverified';
      }
      const owner = contact.properties.hubspot_owner_id;
      if (owner === null || owner === '') return 'unassigned';
      if (typeof owner === 'string' && positiveId.test(owner)) return 'assigned';
      return 'contact_unverified';
    } catch {
      return 'contact_unverified';
    }
  };
}

export async function reconcileAndCheckAssignment({ store, crm, readAssignment }) {
  const result = await reconcileOne({ store, crm });
  if (result.status !== 'synced') return result;
  const receipt = 'LR-' + result.request_id.replaceAll('-', '').toUpperCase();
  // Read the durable link after finish. An inconclusive observation never reopens the queue.
  const assignment_status = await readAssignment(receipt);
  return { ...result, assignment_status };
}
