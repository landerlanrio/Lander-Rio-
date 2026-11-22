import {createHmac} from 'node:crypto';
import {CaptureError,createCaptureHandler,normalize} from './core.mjs';
import {createSupabaseStore} from './supabase-store.mjs';
export const STAGING_PROJECT_URL='https://riplqdzgwlggvhbznovm.supabase.co';
export const STAGING_ALLOWED_ORIGIN='https://lander-rio-commercial-hml-20261122.netlify.app';
export const STAGING_CAPTURE_VERSION='hml-20261122-1';
// QA only. The project guard prevents accidental use of the production database.
export function createStagingCaptureHandler({env,fetchImpl=fetch}){
 return async request=>{
  const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex, nofollow, noarchive','x-lander-capture-version':STAGING_CAPTURE_VERSION};
  const reply=(body,status,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,...extra}});
  try{
   const url=env.get('SUPABASE_URL'),key=env.get('SUPABASE_SERVICE_ROLE_KEY');
   if(url!==STAGING_PROJECT_URL||!key)return reply({ok:false,error:'staging_not_configured'},503);
   if(request.headers.get('origin')!==STAGING_ALLOWED_ORIGIN)return reply({ok:false,error:'origin_not_allowed'},403);
   if(request.method==='GET'&&new URL(request.url).pathname.endsWith('/health')){
    const probe=await fetchImpl(url+'/rest/v1/commercial_requests?select=request_id&limit=0',{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(8000)});
    if(!probe.ok)return reply({ok:false,error:'temporarily_unavailable'},503);
    return reply({environment:'isolated-staging',supabase_project_id:'riplqdzgwlggvhbznovm',storage_ready:true,crm_sync_enabled:false,outbound_enabled:false,capture_path:'/api/commercial/lead',version:STAGING_CAPTURE_VERSION},200);
   }
   if(request.method!=='POST')return reply({ok:false,error:'method_not_allowed'},405);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({ok:false,error:'invalid_content_type'},415);
   if(Number(request.headers.get('content-length'))>8192)return reply({ok:false,error:'payload_too_large'},413);
   const text=await request.text();if(text.length>8192)return reply({ok:false,error:'payload_too_large'},413);
   let input;try{input=JSON.parse(text);}catch{return reply({ok:false,error:'invalid_json'},400);}
   const record=normalize(input);
   if(!record.email.endsWith('@example.test'))return reply({ok:false,error:'staging_synthetic_data_only'},400);
   const rawIP=(request.headers.get('x-forwarded-for')||'').split(',')[0].trim();
   const ip=/^[a-f0-9:.]{3,80}$/i.test(rawIP)?rawIP:'unknown';
   // Never retain or log a raw IP. The global bucket also bounds requests if IP headers vary.
   const bucket=createHmac('sha256',key).update('commercial-hml|'+ip).digest('hex');
   const limited=await fetchImpl(url+'/rest/v1/rpc/allow_commercial_staging_request',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({p_key:bucket}),signal:AbortSignal.timeout(8000)});
   if(!limited.ok)return reply({ok:false,error:'temporarily_unavailable'},503);
   const allowance=await limited.json();
   if(allowance?.allowed!==true)return reply({ok:false,error:'rate_limited'},429,{'retry-after':String(Math.max(1,Math.min(60,Number(allowance?.retry_after)||60)))});
   const store=createSupabaseStore({url,key,fetchImpl});
   const response=await createCaptureHandler({store,allowedOrigins:[STAGING_ALLOWED_ORIGIN]})(new Request(request.url,{method:'POST',headers:request.headers,body:text}));
   const merged=new Headers(response.headers);merged.set('x-lander-capture-version',STAGING_CAPTURE_VERSION);merged.set('x-robots-tag','noindex, nofollow, noarchive');merged.set('cache-control','no-store');
   return new Response(response.body,{status:response.status,headers:merged});
  }catch(error){
   if(error instanceof CaptureError)return reply({ok:false,error:error.code},error.status);
   return reply({ok:false,error:'temporarily_unavailable'},503);
  }
 };
}
