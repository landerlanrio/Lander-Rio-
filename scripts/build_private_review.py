#!/usr/bin/env python3
"""Build the RC10 owner-private preview, preserving live tools outside preview."""
import argparse
import json
import re
import shutil
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'


def build(destination):
    routes={}
    live_tools={'/treino/','/dieta/','/radar-performance/'}
    for page in SITE.rglob('*.html'):
        name=page.relative_to(SITE).as_posix()
        route='/' if name=='index.html' else '/'+name.removesuffix('index.html') if name.endswith('/index.html') else '/'+name.removesuffix('.html')
        routes[route]=name
    destination.mkdir(parents=True, exist_ok=True)
    for item in SITE.iterdir():
        if item.is_file() and item.suffix not in ('.html','.toml') and item.name not in ('_headers','_redirects','sitemap.xml') and not item.name.startswith('manifest-'):
            shutil.copy2(item,destination/item.name)
    shutil.copytree(SITE / 'assets', destination / 'assets', dirs_exist_ok=True)
    for route, filename in routes.items():
        html = (SITE / filename).read_text()
        html = re.sub(r'<script\b[^>]*src="/assets/measurement-[^"]+"[^>]*></script>', '', html)
        html = re.sub(r'<script\b[^>]*src="/assets/(?:performance-rc9|vendor/web-vitals-5.3.0.iife)\.js"[^>]*></script>', '', html)
        html = re.sub(r'<script\b[^>]*src="/assets/ga4-(?:config|intent)\.js"[^>]*></script>', '', html)
        html = re.sub(r'<meta\b[^>]*name="robots"[^>]*>', '', html)
        html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow,noarchive"></head>')

        def href(match):
            value = match[1]
            parsed = urlsplit(value)
            if value.startswith('/') and not value.startswith('//'):
                if parsed.path in live_tools or (parsed.path not in routes and not parsed.path.startswith('/assets/') and parsed.path != '/favicon.png'):
                    value = 'https://landerrio.com.br' + value
            return 'href="' + value + '"'

        html = re.sub(r'href="([^"]+)"', href, html)
        if route in live_tools:
            html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Ferramenta preservada — LANDER RIO</title><body style="background:#101211;color:#eee;font:18px system-ui;padding:8vw"><h1>Ferramenta no site publicado</h1><p>O preview RC10 apresenta a evolução editorial. Para utilizar esta ferramenta e seu cadastro, acesse a versão publicada.</p><a style="color:#d5ed86" href="https://landerrio.com.br'+route+'">Abrir ferramenta no site LANDER RIO</a><p><a style="color:#d5ed86" href="/">Voltar ao preview</a></p></body></html>'
        target = destination / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html)
        # Static preview hosts may not support Netlify's extensionless prettification.
        if filename.endswith('.html') and not filename.endswith('index.html') and filename!='404.html':
            pretty=destination/route.lstrip('/')/'index.html';pretty.parent.mkdir(parents=True,exist_ok=True);pretty.write_text(html)
    (destination / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
    (destination / 'review-version.json').write_text(json.dumps({
        'release': json.loads((SITE/'release.json').read_text())['version'],
        'purpose': 'Private review, separate from landerrio.com.br',
        'pages': list(routes),
        'analytics': 'disabled',
        'tools_open_production':sorted(live_tools),
        'production_changed': False,
    }, ensure_ascii=False, indent=2))
    print(json.dumps({'directory': str(destination), 'pages': len(routes), 'analytics': 'disabled'}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', required=True, type=Path)
    build(parser.parse_args().out)
