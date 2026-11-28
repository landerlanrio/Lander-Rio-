import { createSupabaseStore } from './supabase-store.mjs';
import { createHubSpotCRM } from './reconcile.mjs';
import { createAssignmentReader, reconcileAndCheckAssignment } from './contact-assignment.mjs';

const [command, argument, ...extra] = process.argv.slice(2);
const apply = command === 'reconcile-one' && argument === '--apply';
const verify = command === 'verify-assignment' && /^LR-[A-F0-9]{32}$/.test(argument || '');
if ((!apply && !verify) || extra.length) {
  throw Error('Use reconcile-one --apply after approval, or verify-assignment LR-<receipt>.');
}
if (apply && process.env.COMMERCIAL_CRM_SYNC_ENABLED !== 'true') throw Error('CRM sync is disabled');

const supabaseUrl = process.env.COMMERCIAL_SUPABASE_URL;
const supabaseKey = process.env.COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY;
const hubspotToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const readAssignment = createAssignmentReader({ supabaseUrl, supabaseKey, hubspotToken });
if (verify) {
  console.log(JSON.stringify({ assignment_status: await readAssignment(argument) }));
} else {
  const store = createSupabaseStore({ url: supabaseUrl, key: supabaseKey });
  const crm = createHubSpotCRM({ token: hubspotToken });
  const result = await reconcileAndCheckAssignment({ store, crm, readAssignment });
  console.log(JSON.stringify(result));
}
