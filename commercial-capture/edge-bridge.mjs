import {STAGING_PROJECT_URL,STAGING_ALLOWED_ORIGIN,STAGING_CAPTURE_VERSION} from './staging-edge.mjs';
const endpoint=STAGING_PROJECT_URL+'/functions/v1/commercial-capture-hml';
const errors=new Set(['invalid_request','unexpected_field','invalid_request_id','invalid_intent','invalid_email','invalid_name','privacy_required','invalid_content_type','invalid_json','payload_too_large','origin_not_allowed','idempotency_conflict','rate_limited','staging_synthetic_data_only','temporarily_unavailable']);
function configOK(config){return config.endpoint===endpoint&&config.origin===STAGING_ALLOWED_ORIGIN&&typeof config.key==='string'&&config.key.length>20;}
function response(value,status,extra={}){return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow, noarchive',...extra}});}
export function createEdgeBridge(config){
 return async request=>{
  if(!configOK(config))return response({ok:false,error:'temporarily_unavailable'},503);
  if(request.method!=='POST')return response({ok:false,error:'method_not_allowed'},405);
  if(request.headers.get('origin')!==config.origin)return response({ok:false,error:'origin_not_allowed'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return response({ok:false,error:'invalid_content_type'},415);
  try{
   if(Number(request.headers.get('content-length'))>8192)return response({ok:false,error:'payload_too_large'},413);
   const body=await request.text();if(body.length>8192)return response({ok:false,error:'payload_too_large'},413);
   const result=await(config.fetchImpl||fetch)(config.endpoint,{method:'POST',headers:{origin:config.origin,'content-type':'application/json',apikey:config.key,Authorization:'Bearer '+config.key},body,signal:AbortSignal.timeout(8000)});
   const value=await result.json();
   if(result.ok){
    if(![200,201].includes(result.status)||value?.ok!==true||value.saved!==true||!/^LR-[A-F0-9]{32}$/.test(value.receipt||''))throw Error('invalid_ack');
    return response({ok:true,saved:true,receipt:value.receipt,duplicate:value.duplicate===true,crm_status:value.crm_status==='synced'?'synced':'pending'},result.status,{'x-lander-capture-version':STAGING_CAPTURE_VERSION});
   }
   if(![400,403,409,413,415,429,503].includes(result.status)||!errors.has(value?.error))throw Error('invalid_remote_error');
   const retry=result.status===429?{'retry-after':String(Math.max(1,Math.min(60,Number(result.headers.get('retry-after'))||60)))}:{};
   return response({ok:false,error:value.error},result.status,retry);
  }catch{return response({ok:false,error:'temporarily_unavailable'},503);}
 };
}
export function createEdgeHealth(config){
 return async request=>{
  if(!configOK(config))return response({ok:false,error:'temporarily_unavailable'},503);
  if(request.method!=='GET')return response({ok:false,error:'method_not_allowed'},405);
  try{
   const result=await(config.fetchImpl||fetch)(config.endpoint+'/health',{headers:{origin:config.origin,apikey:config.key,Authorization:'Bearer '+config.key},signal:AbortSignal.timeout(8000)});
   const value=await result.json();
   if(!result.ok||value.environment!=='isolated-staging'||value.supabase_project_id!=='riplqdzgwlggvhbznovm'||value.storage_ready!==true||value.crm_sync_enabled!==false||value.outbound_enabled!==false)throw Error('invalid_health');
   return response({environment:'isolated-staging',supabase_project_id:value.supabase_project_id,storage_ready:true,crm_sync_enabled:false,outbound_enabled:false,capture_path:'/api/commercial/lead',version:STAGING_CAPTURE_VERSION},200);
  }catch{return response({ok:false,error:'temporarily_unavailable'},503);}
 };
}
