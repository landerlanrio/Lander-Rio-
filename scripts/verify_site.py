#!/usr/bin/env python3
"""Verify LANDER RIO static-site integrity and local references (stdlib only)."""
from __future__ import annotations
import hashlib, json, re, sys
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
ISSUES = []
WARNINGS = []


def fail(code, msg):
    ISSUES.append((code, msg))


def verify_manifest():
    # Historic manifest stays immutable; every approved redesign byte is tracked
    # in an additive overlay rather than weakening the original integrity check.
    manifest = json.loads((SITE/'manifest-v23-10.json').read_text(encoding='utf-8'))
    records = dict(manifest.get('files', {}))
    manifest_files = {'manifest-v23-10.json'}
    overlay_path = SITE/'manifest-flagship-v25.json'
    if overlay_path.is_file():
        overlay = json.loads(overlay_path.read_text(encoding='utf-8'))
        if overlay.get('base_manifest') != 'manifest-v23-10.json':
            fail('bad-overlay-base', 'manifest-flagship-v25.json')
        records.update(overlay.get('files', {}))
        manifest_files.add('manifest-flagship-v25.json')
    actual = {p.relative_to(SITE).as_posix() for p in SITE.rglob('*') if p.is_file()}
    expected = set(records) | manifest_files
    for extra in sorted(actual - expected): fail('untracked', extra)
    for missing in sorted(expected - actual): fail('missing', missing)
    for rel, recorded in records.items():
        file = SITE / rel
        if not file.is_file(): continue
        observed = hashlib.sha256(file.read_bytes()).hexdigest()
        if observed.lower() != recorded.lower(): fail('hash-mismatch', rel)
    return len(records)


def path_exists(raw, page):
    parsed = urlsplit(raw)
    if not raw or raw.startswith(('#', '//', 'data:', 'mailto:', 'tel:', 'javascript:', 'sms:', 'wa.me:')) or parsed.scheme or parsed.netloc:
        return True
    path = unquote(parsed.path)
    if not path: return True
    p = (PurePosixPath(path.lstrip('/')) if path.startswith('/')
         else PurePosixPath(page).parent / path)
    stack = []
    for part in p.parts:
        if part == '..':
            if stack: stack.pop()
            else: return False
        elif part not in ('.', '', '/'): stack.append(part)
    norm = '/'.join(stack)
    if not norm: norm='index.html'
    possible=(norm, norm.rstrip('/')+'/index.html', norm+'.html')
    if any((SITE / candidate).is_file() for candidate in possible): return True
    # Netlify redirect and page prettification rules for URL aliases.
    aliases={
        'privacidade':'privacidade.html', 'termos':'termos.html',
        'performance-lab':'treino/index.html','performance-club':'treino/index.html',
        'nutrition':'dieta/index.html', 'nutrition-blueprint':'dieta/index.html',
        'faq':'perguntas-frequentes/index.html','procedencia':'autenticidade/index.html',
        'comece':'contato/index.html', 'comecar':'contato/index.html'
    }
    return (norm.rstrip('/') in aliases and (SITE/aliases[norm.rstrip('/')]).is_file())


class LocalRefs(HTMLParser):
    def __init__(self,page):
        super().__init__(convert_charrefs=True); self.page=page; self.count=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        for key in ('href','src','poster'):
            raw=a.get(key)
            if raw is None: continue
            self.count+=1
            if not path_exists(raw,self.page):
                fail('missing-reference', f'{self.page}: {key}={raw[:160]}')
        for key in ('srcset',):
            if a.get(key):
                for item in a[key].split(','):
                    url=item.strip().split(' ',1)[0]
                    if url and not path_exists(url,self.page):
                        fail('missing-srcset', f'{self.page}: {url[:160]}')


def verify_html():
    pages = list(SITE.rglob('*.html'))
    refs=0
    for page in pages:
        rel=page.relative_to(SITE).as_posix()
        parser=LocalRefs(rel)
        try: parser.feed(page.read_text(encoding='utf-8'))
        except Exception as exc: fail('bad-html-parse', f'{rel}: {exc}')
        refs+=parser.count
    return len(pages),refs


def verify_css():
    count=0
    for stylesheet in SITE.rglob('*.css'):
        rel=stylesheet.relative_to(SITE).as_posix()
        content=stylesheet.read_text(encoding='utf-8', errors='replace')
        for match in re.finditer(r"url\(\s*['\"]?([^)'\"]+)", content, re.I):
            raw=match.group(1).strip()
            if not raw or raw.startswith('data:'): continue
            count+=1
            if not path_exists(raw, rel):
                fail('missing-css-asset', f'{rel}: {raw[:160]}')
    return count


def verify_sitemap():
    sitemap=SITE/'sitemap.xml'
    if not sitemap.is_file(): fail('no-sitemap','missing sitemap.xml');return 0
    try:
        root=ElementTree.parse(sitemap).getroot()
    except ElementTree.ParseError as exc:
        fail('sitemap-not-xml',str(exc));return 0
    urls=[]
    for n in root.iter():
        if n.tag.split('}')[-1]=='loc' and n.text:
            url=n.text.strip(); urls.append(url)
            if urlsplit(url).hostname=='landerrio.com.br' and not path_exists(urlsplit(url).path,'index.html'):
                fail('sitemap-404', url)
    return len(urls)


def verify_json():
    n=0
    for f in SITE.rglob('*.json'):
        try:json.loads(f.read_text(encoding='utf-8'))
        except (ValueError,UnicodeError) as exc:fail('invalid-json',f'{f.relative_to(SITE)}: {exc}')
        n+=1
    return n


def verify_credentials():
    # Public analytics ingestion keys and Supabase anon keys are client-visible; this checks for secret formats.
    rules={
        'private_key':re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
        'github_pat':re.compile(r'(?:ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[A-Za-z0-9_]{20,}'),
        'aws_access_id':re.compile(r'AKIA[0-9A-Z]{16}'),
        'openai_secret':re.compile(r'\bsk-(?:proj-)?[A-Za-z0-9_-]{35,}\b'),
    }
    for file in SITE.rglob('*'):
        if not file.is_file() or file.suffix.lower() not in ('.html','.css','.js','.json','.toml','.txt','.md','.xml'):continue
        try: text=file.read_text(encoding='utf-8')
        except UnicodeError: continue
        for name,regex in rules.items():
            if regex.search(text):fail('potential-secret',f'{name}: {file.relative_to(SITE)}')


def main():
    required=['index.html','_headers','_redirects','netlify.toml','release.json','manifest-v23-10.json','robots.txt','sitemap.xml']
    for f in required:
        if not (SITE/f).is_file():fail('missing-core',f)
    manifest_count=verify_manifest()
    html_count, references=verify_html()
    sitemap_count=verify_sitemap()
    css_count=verify_css()
    json_count=verify_json()
    verify_credentials()
    release=json.loads((SITE/'release.json').read_text())
    if release.get('version') != '23.10':fail('unexpected-version',str(release.get('version')))
    if html_count != 81:fail('unexpected-pages',str(html_count))
    print(json.dumps({'status':'PASS' if not ISSUES else 'FAIL',
         'version':release.get('version'),'manifest_verified_sha256':manifest_count,
         'html_pages':html_count,'html_local_references_checked':references,
         'json_files_checked':json_count,'sitemap_urls':sitemap_count,
         'css_asset_references_checked':css_count,
         'issues':ISSUES,'warnings':WARNINGS},indent=2,ensure_ascii=False))
    return 0 if not ISSUES else 1

if __name__=='__main__':sys.exit(main())
