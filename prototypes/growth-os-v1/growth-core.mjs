/* LANDER RIO — GROWTH OS 1.0: privacy-first, read-only funnel QA.
 * No network, storage, CRM records, WhatsApp sends or model calls.
 */
const DEFINITIONS = Object.freeze({
  site_visit: { source: 'browser', stage: 'visits' },
  whatsapp_open_click: { source: 'browser', stage: 'whatsappAttempts' },
  utility_registration_confirmed: { source: 'backend', stage: 'registrations' },
  contact_confirmed: { source: 'verified_inbox', stage: 'confirmedContacts' },
  lead_qualified: { source: 'crm', stage: 'qualifiedLeads' },
  purchase_confirmed: { source: 'verified_order', stage: 'verifiedPurchases' },
});
const STAGES = ['visits','whatsappAttempts','registrations','confirmedContacts','qualifiedLeads','verifiedPurchases'];
const SAFE_PATTERN = /^[a-z0-9][a-z0-9._:-]{2,79}$/i;

export function validateEvidence(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  const { event, source, eventId, consent, verified } = record;
  const definition = Object.hasOwn(DEFINITIONS, event) ? DEFINITIONS[event] : null;
  if (!definition || source !== definition.source || typeof eventId !== 'string' || !SAFE_PATTERN.test(eventId)) return null;
  if (source === 'browser' && consent !== true) return null;
  // Reporting contract only: the backend MUST verify evidence independently.
  // Never trust a client-supplied verified flag to authorize a CRM state.
  if (source !== 'browser' && verified !== true) return null;
  return Object.freeze({ event, source, eventId, stage: definition.stage });
}
export function summarizeEvidence(records) {
  const result = Object.fromEntries(STAGES.map(key => [key, 0]));
  const seen = new Set(); let rejected = 0, duplicates = 0;
  for (const record of Array.isArray(records) ? records : []) {
    const entry = validateEvidence(record);
    if (!entry) { rejected++; continue; }
    const dedupKey = entry.source + ':' + entry.eventId;
    if (seen.has(dedupKey)) { duplicates++; continue; }
    seen.add(dedupKey);
    result[entry.stage]++;
  }
  return Object.freeze({ ...result, rejected, duplicates, units: 'unique_verified_event_ids', isConversionFunnel: false });
}
export function sanitizeBrowserEvent(event, consent) {
  if (consent !== true || !['site_visit','whatsapp_open_click'].includes(event)) return null;
  return Object.freeze({event, source: 'browser'});
}
export function evaluateSeoCandidate(input) {
  if (!input || typeof input.url !== 'string' || !input.url.startsWith('https://landerrio.com.br/')) return null;
  const { impressions, clicks, position, reviewStatus } = input;
  if (![impressions, clicks, position].every(Number.isFinite) || impressions < 0 || clicks < 0 || clicks > impressions || position < 1) return null;
  const url = new URL(input.url);
  if (url.search || url.hash || url.username || url.password || url.port || url.hostname !== 'landerrio.com.br') return null;
  if (reviewStatus !== 'editorially_approved') return Object.freeze({url: url.href, status: 'hold', reason: 'editorial_review_required'});
  // Priority heuristic, not projected additional traffic or revenue.
  const nearTop = position >= 4 && position <= 20;
  const opportunity = nearTop ? Math.round(impressions * (1 - clicks / Math.max(impressions,1)) * (position <= 10 ? 1 : 0.6)) : 0;
  return Object.freeze({url: url.href, status: 'review_candidate', opportunity, impressions, clicks, position});
}
export const CONTRACT_VERSION = '1.0.0-staging';
