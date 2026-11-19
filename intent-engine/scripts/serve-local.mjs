import http from 'node:http';import fs from 'node:fs';
// Loopback only; this is a private offline preview, not remote authentication.
const html=fs.readFileSync(new URL('../index.html',import.meta.url));
http.createServer((req,res)=>{if(req.url!=='/'&&req.url!=='/index.html'){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);}).listen(4177,'127.0.0.1',()=>console.log('Preview local: http://127.0.0.1:4177'));
