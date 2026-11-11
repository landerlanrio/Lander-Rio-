#!/usr/bin/env python3
"""Read-only HTTP smoke test of the exact site directory, no external network needed."""
from __future__ import annotations
import functools, http.server, json, socket, threading, urllib.request
from pathlib import Path
SITE=Path(__file__).resolve().parent.parent/'site'

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

def main():
    handler=functools.partial(QuietHandler,directory=str(SITE))
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
    thread=threading.Thread(target=server.serve_forever,daemon=True)
    thread.start()
    urls=['/','/atacado/','/varejo/','/treino/','/dieta/','/entregas/',
          '/enciclopedia/','/contato/','/ferramentas/','/perguntas-frequentes/',
          '/release.json','/sitemap.xml','/robots.txt',
          '/assets/commerce-v21.js','/assets/measurement-v23-2.js']
    checks=[]
    try:
        for path in urls:
            with urllib.request.urlopen(f'http://127.0.0.1:{server.server_port}{path}',timeout=5) as response:
                body=response.read()
                passed=(response.status==200 and len(body)>0)
                checks.append({'path':path,'status':response.status,'bytes':len(body),'passed':passed})
                if not passed: raise RuntimeError(f'Empty or failed: {path}')
        print(json.dumps({'status':'PASS','route_count':len(checks),'routes':checks},indent=2))
        return 0
    finally:
        server.shutdown();server.server_close();thread.join(timeout=2)

if __name__=='__main__':raise SystemExit(main())
