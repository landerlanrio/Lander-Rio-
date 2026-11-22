/**
 * ROX 3.0 — PRIVATE LOCAL PREVIEW ONLY.
 * Start with: node --experimental-strip-types prototypes/rox-ai-v2/preview-private/server.mjs
 * Loopback-only; no external models, WhatsApp sends, database, CRM, or production deploy.
 * Adapter rewrites the Origin exclusively inside localhost to exercise the unchanged
 * production-domain whitelist of the actual ROX handler. NEVER deploy this adapter.
 */
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const directory=path.dirname(fileURLToPath(import.meta.url));
const assets=new Map([
 ['/', ['index.html','text/html; charset=utf-8']],
 ['/index.html',['index.html','text/html; charset=utf-8']],
 ['/preview.js',['preview.js','text/javascript; charset=utf-8']],
 ['/preview.css',['preview.css','text/css; charset=utf-8']]
]);
const MAX_BODY_BYTES=18_000;
const headers={
 'cache-control':'no-store, max-age=0',
 'x-content-type-options':'nosniff',
 'x-frame-options':'DENY',
 'referrer-policy':'no-referrer',
 'permissions-policy':'camera=(), microphone=(), geolocation=(), payment=()',
 'content-security-policy':"default-src 'none'; base-uri 'none'; form-action 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'",
 'x-robots-tag':'noindex, nofollow'
};
function write(res,status,body,additional={}){
 res.writeHead(status,{...headers,...additional});res.end(body);
}
let backendPromise;
async function getBackend(){
 if(!backendPromise){
  // Forced local dry-run: no provider secrets can be read by the Deno adapter.
  globalThis.Deno={env:{get:()=>undefined},serve:()=>{}};
  backendPromise=import('../index.ts').then(mod=>mod.handler);
 }
 return backendPromise;
}
function isLocalRequest(req){
 const ip=req.socket.remoteAddress||'';
 const host=(req.headers.host||'').toLowerCase();
 return (ip==='127.0.0.1'||ip==='::1'||ip==='::ffff:127.0.0.1') && /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host);
}
async function api(req,res,pathname){
 const expected=req.method==='POST'&&pathname==='/api/rox/chat';
 if(!expected && !(req.method==='GET'&&pathname==='/api/rox/health')){
  write(res,405,JSON.stringify({error:'method_not_allowed'}),{'content-type':'application/json'});return;
 }
 let raw='';
 if(expected){
  if(!(req.headers['content-type']||'').startsWith('application/json')){
   write(res,415,JSON.stringify({error:'json_required'}),{'content-type':'application/json'});return;
  }
  const chunks=[];
  let bytes=0;
  for await(const chunk of req){
   bytes+=chunk.length;
   if(bytes>MAX_BODY_BYTES){write(res,413,JSON.stringify({error:'request_too_large'}),{'content-type':'application/json'});return;}
   chunks.push(chunk);
  }
  raw=Buffer.concat(chunks).toString('utf8');
 }
 const handler=await getBackend();
 const upstream=new Request('https://landerrio.com.br/'+(expected?'chat':'health'),{
  method:expected?'POST':'GET',
  headers:{origin:'https://landerrio.com.br',...(expected?{'content-type':'application/json'}:{})},
  ...(expected?{body:raw}:{})
 });
 const result=await handler(upstream);
 const body=await result.text();
 write(res,result.status,body,{'content-type':'application/json; charset=utf-8'});
}
export async function startPrivatePreview(port=0){
 const server=http.createServer(async(req,res)=>{
  try{
   if(!isLocalRequest(req)){write(res,403,'Forbidden');return;}
   const u=new URL(req.url||'/', 'http://127.0.0.1');
   if(u.pathname.startsWith('/api/rox/')){await api(req,res,u.pathname);return;}
   if(req.method!=='GET'){write(res,405,'Method Not Allowed');return;}
   const asset=assets.get(u.pathname);
   if(!asset){write(res,404,'Not Found');return;}
   const body=await readFile(path.join(directory,asset[0]));
   write(res,200,body,{'content-type':asset[1]});
  }catch{
   write(res,500,JSON.stringify({error:'preview_internal_error'}),{'content-type':'application/json'});
  }
 });
 await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(port,'127.0.0.1',resolve);
 });
 const address=server.address();
 return {server,url:'http://127.0.0.1:'+address.port};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {url}=await startPrivatePreview(Number(process.env.ROX_PREVIEW_PORT)||0);
 console.log('ROX 3.0 — homologação local privada: '+url);
 console.log('Sem deploy, sem modelos pagos, sem envio ao WhatsApp ou CRM.');
}
