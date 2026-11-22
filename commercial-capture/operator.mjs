import { createSupabaseStore } from './supabase-store.mjs';
import { createHubSpotCRM,reconcileOne } from './reconcile.mjs';
// Not a daemon. Requires specific production approval before execution with real credentials.
if(process.argv[2]!=='reconcile-one'||process.argv[3]!=='--apply')throw Error('Use reconcile-one --apply only after approval. For lookup, use the authenticated Supabase SQL Editor.');
if(process.env.COMMERCIAL_CRM_SYNC_ENABLED!=='true')throw Error('CRM sync is disabled');
const store=createSupabaseStore({url:process.env.COMMERCIAL_SUPABASE_URL,key:process.env.COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY});
const crm=createHubSpotCRM({token:process.env.HUBSPOT_PRIVATE_APP_TOKEN});
const result=await reconcileOne({store,crm});console.log(JSON.stringify(result));
