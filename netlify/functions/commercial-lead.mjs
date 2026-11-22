import { createCaptureHandler } from '../../commercial-capture/core.mjs';
import { createEdgeBridge } from '../../commercial-capture/edge-bridge.mjs';
import { createSupabaseStore } from '../../commercial-capture/supabase-store.mjs';
export default async request=>{
 try{
  const edgeEndpoint=Netlify.env.get('COMMERCIAL_EDGE_ENDPOINT'),edgeKey=Netlify.env.get('COMMERCIAL_EDGE_ANON_KEY');
  if(edgeEndpoint||edgeKey){
   if(Netlify.env.get('COMMERCIAL_SUPABASE_URL')||Netlify.env.get('COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY')||Netlify.env.get('COMMERCIAL_DIRECT_FIXTURE'))throw Error('ambiguous_capture_configuration');
   return await createEdgeBridge({endpoint:edgeEndpoint,key:edgeKey,origin:Netlify.env.get('COMMERCIAL_ALLOWED_ORIGIN'),environment:Netlify.env.get('COMMERCIAL_EDGE_ENVIRONMENT')})(request);
  }
  // RPC mode exists only for the isolated local/CI compiled-function fixture.
  const url=Netlify.env.get('COMMERCIAL_SUPABASE_URL'),origin=Netlify.env.get('COMMERCIAL_ALLOWED_ORIGIN');
  if(Netlify.env.get('COMMERCIAL_DIRECT_FIXTURE')!=='true'||Netlify.env.get('COMMERCIAL_EDGE_ENVIRONMENT')||!['https://synthetic.supabase.co','https://localqa.supabase.co'].includes(url)||origin!=='https://isolated.example.test')throw Error('direct_fixture_only');
  const store=createSupabaseStore({url,key:Netlify.env.get('COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY')});
  return await createCaptureHandler({store,allowedOrigins:[origin]})(request);
 }catch{
  return Response.json({ok:false,error:'temporarily_unavailable'},{status:503,headers:{'cache-control':'no-store'}});
 }
};
export const config={path:'/api/commercial/lead',method:['POST'],rateLimit:{action:'rate_limit',aggregateBy:['domain','ip'],windowSize:60,windowLimit:10}};
