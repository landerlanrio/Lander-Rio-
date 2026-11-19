import html from '../../lib/dashboard-bundle.mjs';
import { toSnapshot } from '../../lib/ingestion.mjs';
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"};
export function makeHandler({env=k=>globalThis.Netlify?.env.get(k),fetcher=fetch}={}) {
 return async(request,context={})=>{
  const respond=(body,status=200,type='text/plain; charset=utf-8')=>new Response(body,{status,headers:{...headers,'Content-Type':type}});
  if(request.method!=='GET')return respond('Método não permitido',405);
  const user=context.user;
  if(!user?.id||!user.expiresAt||!Number.isFinite(new Date(user.expiresAt).getTime())||new Date(user.expiresAt).getTime()<=Date.now())return respond('Autenticação Netlify necessária',401);
  const allowed=(env('INTENT_ALLOWED_USER_IDS')||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!allowed.includes(user.id))return respond('Acesso não autorizado',403);
  if(new URL(request.url).pathname==='/intent/api/snapshot'){
   const token=env('INTENT_GITHUB_READ_TOKEN');
   if(!token)return respond(JSON.stringify({error:'live_source_not_configured'}),503,'application/json');
   try{
    const url='https://api.github.com/repos/landerlanrio/Lander-Rio-/contents/intent-engine/data/openseo-latest.json?ref=feature%2Fintent-engine-v2';
    const res=await fetcher(url,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github.raw+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(10000),redirect:'error'});
    if(!res.ok)throw Error('upstream');
    const text=await res.text();if(text.length>4000000)throw Error('size');
    return respond(JSON.stringify(toSnapshot(JSON.parse(text))),200,'application/json');
   }catch{return respond(JSON.stringify({error:'source_unavailable',retainedSnapshot:true}),502,'application/json');}
  }
  return respond(html,200,'text/html; charset=utf-8');
 };
}
export default makeHandler();
export const config={path:['/intent/','/intent/api/snapshot']};
