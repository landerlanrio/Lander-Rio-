import {createEdgeHealth} from '../../commercial-capture/edge-bridge.mjs';
export default async request=>{
 try{
  if(Netlify.env.get('COMMERCIAL_SUPABASE_URL')||Netlify.env.get('COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY'))throw Error('ambiguous_capture_configuration');
  return await createEdgeHealth({endpoint:Netlify.env.get('COMMERCIAL_EDGE_ENDPOINT'),key:Netlify.env.get('COMMERCIAL_EDGE_ANON_KEY'),origin:Netlify.env.get('COMMERCIAL_ALLOWED_ORIGIN')})(request);
 }catch{return Response.json({ok:false,error:'temporarily_unavailable'},{status:503,headers:{'cache-control':'no-store','x-robots-tag':'noindex, nofollow, noarchive'}});}
};
export const config={path:'/api/commercial/health',method:['GET']};
