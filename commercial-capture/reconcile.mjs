// Explicit operator action only. No scheduler and no outbound messages.
export async function reconcileOne({store,crm}){
 const record=await store.claim();if(!record)return {status:'empty'};
 try{
  // Adapter must upsert by email; retries after a timeout target the same CRM contact.
  const result=await crm.upsertContact({email:record.email,name:record.name,request_id:record.request_id});
  if(!result?.id)throw Error('crm_missing_receipt');
  const marked=await store.finish(record.request_id,record.claim_token,String(result.id));
  return {status:marked?'synced':'lease_expired',request_id:record.request_id};
 }catch{
  await store.release(record.request_id,record.claim_token);
  return {status:'pending',request_id:record.request_id};
 }
}
export function createHubSpotCRM({token,fetchImpl=fetch}){
 if(!token)throw Error('crm_not_configured');
 return {async upsertContact({email,name}){
  const r=await fetchImpl('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert',{method:'POST',headers:{Authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({inputs:[{idProperty:'email',id:email,properties:{email,...(name?{firstname:name}:{})}}]}),signal:AbortSignal.timeout(8000)});
  const data=await r.json();if(!r.ok||!data.results?.[0]?.id)throw Error('crm_unavailable');return {id:data.results[0].id};
 }};
}
