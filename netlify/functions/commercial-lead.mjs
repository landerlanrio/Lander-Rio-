import { createCaptureHandler } from '../../commercial-capture/core.mjs';
import { createSupabaseStore } from '../../commercial-capture/supabase-store.mjs';
export default async request=>{
 try{
  const store=createSupabaseStore({url:Netlify.env.get('COMMERCIAL_SUPABASE_URL'),key:Netlify.env.get('COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY')});
  return await createCaptureHandler({store})(request);
 }catch{
  return Response.json({ok:false,error:'temporarily_unavailable'},{status:503,headers:{'cache-control':'no-store'}});
 }
};
export const config={path:'/api/commercial/lead',method:['POST'],rateLimit:{action:'rate_limit',aggregateBy:['domain','ip'],windowSize:60,windowLimit:10}};
