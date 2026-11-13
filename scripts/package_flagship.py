#!/usr/bin/env python3
"""Export a portable homepage and the exact static release; never deploy."""
from pathlib import Path
import argparse
import base64
import hashlib
import json
import mimetypes
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--evidence', type=Path)
    parser.add_argument('--preview-only', action='store_true')
    args = parser.parse_args()
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    release = json.loads((SITE / 'release.json').read_text())['version']
    revision = release.rsplit('-', 1)[-1].upper()
    prefix = 'LANDER_RIO_FLAGSHIP_2026_' + revision
    cache = {}

    def data_url(path):
        if path not in cache:
            file = SITE / path.lstrip('/')
            mime = mimetypes.guess_type(file.name)[0] or 'application/octet-stream'
            cache[path] = 'data:' + mime + ';base64,' + base64.b64encode(file.read_bytes()).decode()
        return cache[path]

    page = (SITE / 'index.html').read_text()
    page = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
                  lambda m: '<style>' + (SITE / m[1].lstrip('/')).read_text() + '</style>', page)
    scripts = []

    def inline_script(match):
        scripts.append('<script>' + (SITE / match[1].lstrip('/')).read_text().replace('</script', '<\\/script') + '</script>')
        return ''

    page = re.sub(r'<script defer src="([^"]+)"></script>', inline_script, page)
    page = re.sub(r'([\'\"])(/assets/[^\'\"]+)\1',
                  lambda m: m[1] + data_url(m[2]) + m[1], page)
    page = page.replace('href="/favicon.png"', 'href="' + data_url('/favicon.png') + '"')
    page = re.sub(r'href="(/(?!/)[^"]*)"', lambda m: 'href="https://landerrio.com.br' + m[1] + '"', page)
    page = page.replace('</body>', ''.join(scripts) + '</body>')
    banner = '<aside class="portable-preview-notice" style="padding:9px 20px;background:#272a24;color:#eee;font:12px/1.5 Arial;text-align:center">PREVIEW ' + revision + ' · Homepage navegável · Outras páginas abrem o site atual · Não publicado</aside>'
    page, count = re.subn(r'(<main id="conteudo"[^>]*>)', lambda m: banner + m[1], page, count=1)
    assert count == 1, 'Portable preview must clearly disclose its scope'
    assert not re.search(r'(?:src|srcset|href)="/assets/', page)
    (out / (prefix + '_PREVIEW.html')).write_text(page)
    if args.preview_only:
        print(json.dumps({'preview': str(out / (prefix + '_PREVIEW.html'))}))
        return

    assert not (SITE / '__qa').exists(), 'Remove the QA harness before export'
    archive = out / (prefix + '_SITE.zip')
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for file in sorted(SITE.rglob('*')):
            if file.is_file():
                z.write(file, file.relative_to(SITE))
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        assert all(z.read(i.filename) == (SITE / i.filename).read_bytes() for i in z.infolist())
        package_files = len(z.infolist())

    shutil.copy2(ROOT / ('docs/DIGITAL_FLAGSHIP_2026_' + revision + '.md'), out / (prefix + '_RELATORIO.md'))
    if args.evidence:
        for file in args.evidence.glob('*.jpg'):
            shutil.copy2(file, out / file.name)
    with zipfile.ZipFile(out / (prefix + '_EVIDENCIAS.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for file in (ROOT / 'docs/evidence' / release).rglob('*'):
            if file.is_file():
                z.write(file, file.relative_to(ROOT / 'docs'))
        for pattern in ('QUALITY_' + revision + '*', 'LOGOS_' + revision + '*', 'HERO_RC2_ASSETS.json'):
            for file in (ROOT / 'docs').glob(pattern):
                z.write(file, file.name)
        for file in out.glob('*.jpg'):
            z.write(file, file.name)
    results = {'release': release, 'site_zip_files': package_files, 'zip_crc': 'PASS', 'zip_byte_comparison': 'PASS',
               'files': [{'name': p.name, 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                         for p in sorted(out.iterdir()) if p.is_file()]}
    (out / (prefix + '_CHECKSUMS.json')).write_text(json.dumps(results, indent=2) + '\n')
    print(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
