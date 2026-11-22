import { createHash } from 'node:crypto';
export class CaptureError extends Error { constructor(code,status=400){super(code);this.code=code;this.status=status;} }
const profiles=new Set(['varejo','atacado']);
const intents=new Set(['consulta','orcamento','envio','suporte']);
const allowedPaths=new Set(['/','/varejo/','/atacado/','/contato/','/marcas/']);
const path=value=>allowedPaths.has(value)?value:'/';
export function normalize(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new CaptureError('invalid_request');
 const allowed=new Set(['request_id','profile','intent','name','email','origin','privacy_ack','website']);
 if(Object.keys(input).some(k=>!allowed.has(k)))throw new CaptureError('unexpected_field');
 if(input.website)throw new CaptureError('invalid_request');
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.request_id||''))throw new CaptureError('invalid_request_id');
 if(!profiles.has(input.profile)||!intents.has(input.intent))throw new CaptureError('invalid_intent');
 const email=String(input.email||'').trim().toLowerCase();
 if(email.length>254||(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\x00-\x1f\x7f]/.test(email)))throw new CaptureError('invalid_email');
 const name=String(input.name||'').trim();
 if(name.length>80||/[\x00-\x1f<>]/.test(name))throw new CaptureError('invalid_name');
 if(input.privacy_ack!==true)throw new CaptureError('privacy_required');
 const raw=input.origin||{},origin={entry_path:path(raw.entry_path),page_path:path(raw.page_path)};
 for(const k of ['utm_source','utm_medium','utm_campaign']){
  const v=String(raw[k]||'').toLowerCase();
  const choices={utm_source:new Set(['instagram','whatsapp','google','facebook','tiktok','direct','ig','fb']),utm_medium:new Set(['social','organic','cpc','referral','bio','story','reel','paid_social','organic_social'])};
  if(k==='utm_campaign'?/^lr-\d{6,12}$/.test(v):choices[k].has(v))origin[k]=v;
 }
 // Never retain raw URL, query string, referrer, arbitrary fields, or analytics identifiers.
 const value={request_id:input.request_id.toLowerCase(),profile:input.profile,intent:input.intent,name,email,origin,privacy_ack:true};
 const fingerprint=createHash('sha256').update(JSON.stringify(value)).digest('hex');
 return {...value,fingerprint};
}
export function createCaptureHandler({store,allowedOrigins=['https://landerrio.com.br','https://www.landerrio.com.br']}){
 return async request=>{
  const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
  const reply=(body,status)=>new Response(JSON.stringify(body),{status,headers});
  if(request.method!=='POST')return reply({ok:false,error:'method_not_allowed'},405);
  const origin=request.headers.get('origin');
  if(!origin||!allowedOrigins.includes(origin))return reply({ok:false,error:'origin_not_allowed'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({ok:false,error:'invalid_content_type'},415);
  try{
   if(Number(request.headers.get('content-length'))>8192)throw new CaptureError('payload_too_large',413);
   const text=await request.text();if(text.length>8192)throw new CaptureError('payload_too_large',413);
   let data;try{data=JSON.parse(text);}catch{throw new CaptureError('invalid_json');}
   const record=normalize(data),saved=await store.save(record);
   if(saved?.saved!==true||!/^LR-[A-F0-9]{32}$/.test(saved.receipt||''))throw Error('invalid_store_ack');
   return reply({ok:true,saved:true,receipt:saved.receipt,duplicate:saved.duplicate===true,crm_status:saved.crm_status==='synced'?'synced':'pending'},saved.duplicate?200:201);
  }catch(error){
   if(error instanceof CaptureError)return reply({ok:false,error:error.code},error.status);
   return reply({ok:false,error:'temporarily_unavailable'},503);
  }
 };
}
