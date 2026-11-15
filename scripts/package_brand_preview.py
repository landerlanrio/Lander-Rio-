#!/usr/bin/env python3
"""Script-free entry to the verified private RC6.3 review.

Attachment viewers may suppress scripts or nested documents. Ordinary HTML
links and embedded screenshots remain visible; the site uses normal pages.
"""
from pathlib import Path
from html import escape
import argparse
import base64
import json
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


def build(out):
    review = json.loads((ROOT / 'docs/PRIVATE_REVIEW_RC6.3.json').read_text())
    url = review['url'].rstrip('/')
    parsed = urlsplit(url)
    assert parsed.scheme == 'https' and not parsed.query and not parsed.fragment
    assert review['status'] == 'succeeded'
    brands = json.loads((ROOT / 'docs/BRAND_PROFILES_RC6.3.json').read_text())['brands']
    evidence = ROOT / 'docs/evidence/digital-flagship-2026-rc6.3/browser'
    def image(filename):
        return 'data:image/jpeg;base64,' + base64.b64encode((evidence / filename).read_bytes()).decode()
    brand_links = ''.join(f'<li><a href="{escape(url)}/marcas/{escape(b["slug"])}/">{escape(b["name"])}</a></li>' for b in brands)
    page = '''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>LANDER RIO — Abrir preview privado RC6.3</title>
<style>
*{box-sizing:border-box}html{background:#101211;color:#f2f1eb;font:16px/1.65 Arial,sans-serif;-webkit-text-size-adjust:100%}body{margin:0}main{max-width:960px;margin:auto;padding:32px 20px 70px}.eyebrow{font-size:11px;letter-spacing:2px;color:#d3ed8c;margin:0 0 18px}h1{font-size:clamp(31px,7vw,52px);line-height:1.08;letter-spacing:-1.4px;margin:0 0 22px}p{max-width:650px;color:#c4c8bf;margin:0 0 22px}a{color:inherit;text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid #d3ed8c;outline-offset:4px}.open-preview{display:flex;align-items:center;justify-content:space-between;gap:15px;max-width:430px;min-height:56px;padding:15px 18px;background:#d3ed8c;color:#101211;text-decoration:none;font-size:15px;font-weight:700;margin:24px 0 16px}.access-note{font-size:13px;line-height:1.6}.secondary{display:inline-flex;align-items:center;min-height:44px;margin:0 0 20px;font-size:14px}details{border-top:1px solid #42483d;border-bottom:1px solid #42483d;margin:20px 0 38px;padding:12px 0}summary{cursor:pointer;min-height:44px;padding:9px 0;font-size:15px}ul{list-style:none;padding:0;margin:10px 0 20px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 16px}li a{display:flex;align-items:center;min-height:44px;font-size:14px}h2{font-size:22px;font-weight:500;margin:0 0 20px}.captures{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:22px}figure{margin:0}figure img{display:block;width:100%;height:auto;border:1px solid #40463c}figcaption{font-size:12px;color:#b9beb2;margin:10px 0 0}.note{margin-top:32px;padding-top:22px;border-top:1px solid #42483d;font-size:13px}@media(max-width:560px){main{padding:26px 20px 55px}.captures{grid-template-columns:1fr;gap:30px}.captures figure{max-width:390px}ul{gap:5px 12px}.open-preview{width:100%}}
</style></head><body><main>
<p class="eyebrow">LANDER RIO / AVALIAÇÃO PRIVADA / RC6.3</p>
<h1>Seu preview está<br>neste link.</h1>
<p>Explore a página inicial, a galeria e as 14 páginas de marcas com suas apresentações e referências de produtos.</p>
<a class="open-preview" href="__URL__">Abrir preview navegável <span aria-hidden="true">↗</span></a>
<p class="access-note">Acesso privado pela sua conta do ChatGPT. Se aparecer a tela de entrada, use a mesma conta desta conversa.</p>
<a class="secondary" href="__URL__/marcas/">Ir direto às marcas →</a>
<details><summary>Escolher uma das 14 marcas</summary><ul>__BRANDS__</ul></details>
<h2>Capturas reais da versão</h2>
<div class="captures"><figure><img src="__GALLERY__" width="390" height="844" alt="Captura real da seção de marcas com fundos uniformes em branco"><figcaption>Galeria de marcas · largura de 390 px.</figcaption></figure>
<figure><img src="__PROFILE__" width="390" height="844" alt="Captura real da página exclusiva da Landerlan"><figcaption>Página da Landerlan · largura de 390 px.</figcaption></figure></div>
<p class="note">Esta é uma cópia privada para avaliação. O site público landerrio.com.br não foi alterado. As seções fora da página inicial e da área de marcas abrem o site público atual.</p>
</main></body></html>'''
    page = page.replace('__URL__', escape(url)).replace('__BRANDS__', brand_links)
    page = page.replace('__GALLERY__', image('LANDER_RIO_RC6_3_MARCAS_390.jpg'))
    page = page.replace('__PROFILE__', image('LANDER_RIO_RC6_3_LANDERLAN_390.jpg'))
    assert '<iframe' not in page and '<script' not in page
    out.write_text(page)
    print(json.dumps({'file': str(out), 'private_review': url, 'brand_links': len(brands), 'initial_render': 'static-html', 'scripts': 0, 'iframes': 0, 'bytes': out.stat().st_size}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', type=Path, required=True)
    build(parser.parse_args().out)
