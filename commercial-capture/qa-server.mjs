// Isolated QA: localhost only, SQLite only, no live API forwarding.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve,extname } from 'node:path';
import { createCaptureHandler } from './core.mjs';
import { SQLiteStore } from './sqlite-store.mjs';
const args=process.argv.slice(2),opt=(key,fallback)=>{const i=args.indexOf(key);return i>=0?args[i+1]||fallback:fallback;};
const port=Number(opt('--port','3100')),site=resolve(opt('--site','site')),database=resolve(opt('--database','/tmp/lander-commercial-qa.sqlite'));
const store=new SQLiteStore(database),handler=createCaptureHandler({store,allowedOrigins:[`http://127.0.0.1:${port}`,`http://localhost:${port}`]});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'};
let mode='normal';
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  if(url.pathname==='/__qa/mode'&&req.method==='POST'){
   let body='';for await(const chunk of req)body+=chunk;
   const x=JSON.parse(body);if(!['normal','database_down','saved_timeout','delay'].includes(x.mode)){res.writeHead(400);return res.end();}mode=x.mode;res.writeHead(200);return res.end('ok');
  }
  if(url.pathname==='/__qa/requests'){
   // This operator view exists ONLY in the loopback QA harness with synthetic contacts.
   res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});return res.end(JSON.stringify(store.list()));
  }
  if(url.pathname==='/api/commercial/lead'){
   let body='';for await(const chunk of req){body+=chunk;if(body.length>8192)break;}
   if(mode==='database_down'){res.writeHead(503,{'content-type':'application/json'});return res.end(JSON.stringify({ok:false,error:'temporarily_unavailable'}));}
   if(mode==='delay')await new Promise(r=>setTimeout(r,1000));
   const result=await handler(new Request(url,{method:req.method,headers:req.headers,body}));
   if(mode==='saved_timeout'){mode='normal';await new Promise(r=>setTimeout(r,15000));}
   res.writeHead(result.status,Object.fromEntries(result.headers));return res.end(await result.text());
  }
  if(req.method!=='GET'){res.writeHead(405);return res.end();}
  if(url.pathname.startsWith('/api/')){res.writeHead(503);return res.end('QA: external services disabled');}
  let path=decodeURIComponent(url.pathname);if(path.endsWith('/'))path+='index.html';if(path==='/privacidade'||path==='/termos')path+='.html';
  const file=resolve(site,'.'+path);if(!file.startsWith(site+'/')){res.writeHead(403);return res.end();}
  const data=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; form-action 'self'"});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`QA http://127.0.0.1:${port} | loopback SQLite | no live integrations`));
