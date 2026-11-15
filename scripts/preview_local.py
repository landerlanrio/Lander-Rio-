#!/usr/bin/env python3
"""Run the exact static candidate locally. No backend proxy or live form writes."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import argparse
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--port',type=int,default=8080)
args=parser.parse_args()
site=Path(__file__).resolve().parents[1]/'site'
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlsplit
        u=urlsplit(self.path)
        if u.path.rstrip('/') in ['/privacidade','/termos']:
            self.path=u.path.rstrip('/')+'.html'+('?' + u.query if u.query else '')
        super().do_GET()
server=ThreadingHTTPServer(('127.0.0.1',args.port),partial(Handler,directory=str(site)))
print(f'LANDER RIO DIGITAL FLAGSHIP 2026 RC11 — http://127.0.0.1:{args.port}/',flush=True)
print('Preview local; as rotas /api exigem o ambiente Netlify. Ctrl+C para encerrar.',flush=True)
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
