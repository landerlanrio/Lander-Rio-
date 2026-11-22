import { CaptureError } from './core.mjs';
export function createSupabaseStore({url,key,fetchImpl=fetch}){
 if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url||'')||!key)throw Error('capture_store_not_configured');
 async function rpc(name,body){
  const r=await fetchImpl(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
  const value=r.status===204?null:await r.json();
  if(!r.ok){if(value?.message==='idempotency_conflict')throw new CaptureError('idempotency_conflict',409);throw Error('capture_store_unavailable');}
  return value;
 }
 return {save:record=>rpc('capture_commercial_request',{p_record:record}),claim:()=>rpc('claim_commercial_request',{}),finish:(request_id,token,contact_id)=>rpc('finish_commercial_request',{p_request_id:request_id,p_token:token,p_contact_id:contact_id}),release:(request_id,token)=>rpc('release_commercial_request',{p_request_id:request_id,p_token:token})};
}
