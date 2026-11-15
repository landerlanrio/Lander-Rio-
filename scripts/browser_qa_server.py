#!/usr/bin/env python3
"""Local-only browser QA. Never packaged into site/. No live API forwarding."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,argparse,os
ROOT=Path(__file__).resolve().parents[1]; SITE=ROOT/'site';QA=ROOT/'scripts/browser-qa'
p=argparse.ArgumentParser();p.add_argument('--host',choices=['127.0.0.1'],default='127.0.0.1');p.add_argument('--strictPort',action='store_true');p.add_argument('--port',type=int,default=int(os.environ.get("PORT", "3000")));p.add_argument('--out',type=Path,default=ROOT/'docs/evidence/rc12/browser');a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(SITE),**kwargs)
 def do_GET(self):
  u=urlsplit(self.path);path=unquote(u.path)
  if path.startswith('/__qa/'):
   f=(QA/path.removeprefix('/__qa/')).resolve()
   if not f.is_relative_to(QA) or not f.is_file():return self.send_error(404)
   data=f.read_bytes();self.send_response(200);self.send_header('Content-Type',self.guess_type(str(f)));self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  f=(SITE/path.lstrip('/')).resolve()
  if not f.is_relative_to(SITE):return self.send_error(403)
  if f.is_dir():f=f/'index.html'
  if not f.exists() and path.rstrip('/') in ['/privacidade','/termos']:f=SITE/(path.strip('/')+'.html')
  if f.is_file() and f.suffix=='.html':
   data=f.read_text()
   if 'qa=1' in u.query:data=data.replace('<head>','<head><script src="/__qa/probe.js"></script>',1)
   data=data.encode();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  return super().do_GET()
 def do_POST(self):
  if self.path!='/__qa/result':return self.send_error(405,'Live forms are disabled in local QA')
  n=int(self.headers.get('Content-Length',0))
  if not 0<n<5000000:return self.send_error(413)
  value=json.loads(self.rfile.read(n));(a.out/'browser-results.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
  self.send_response(200);self.end_headers();self.wfile.write(b'ok')
 def log_message(self,fmt,*args):
  if str(args[1]) not in ['200','304']:super().log_message(fmt,*args)
print(f'QA local http://127.0.0.1:{a.port}/__qa/index.html',flush=True)
ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
