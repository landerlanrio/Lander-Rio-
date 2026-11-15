#!/usr/bin/env python3
"""RC8 acceptance checks: destinations, disclosure, SEO and protected assets."""
import json, re, hashlib, unittest
from pathlib import Path
from urllib.parse import urlsplit, unquote
from html.parser import HTMLParser
from xml.etree import ElementTree as ET
R=Path(__file__).resolve().parents[1]; S=R/'site'
class Doc(HTMLParser):
    def __init__(self,s): super().__init__(); self.tags=[]; self.feed(s)
    def handle_starttag(self,t,a): self.tags.append((t,dict(a)))
class Universe(unittest.TestCase):
    def test_local_links_and_fragments_across_all_pages(self):
        errors=[]
        for p in S.rglob('*.html'):
            for tag,a in Doc(p.read_text()).tags:
                if tag!='a' or 'href' not in a: continue
                u=urlsplit(a['href'])
                if u.scheme or u.netloc or not u.path: continue
                target=S/u.path.lstrip('/') if u.path.startswith('/') else p.parent/u.path
                if target.is_dir(): target/= 'index.html'
                elif not target.exists() and target.with_suffix('.html').exists(): target=target.with_suffix('.html')
                if not target.exists(): errors.append((str(p.relative_to(S)),a['href']))
                elif u.fragment and target.suffix=='.html':
                    ids={b.get('id') for _,b in Doc(target.read_text()).tags}
                    if unquote(u.fragment) not in ids: errors.append((str(p.relative_to(S)),a['href']))
        self.assertEqual(errors,[])
    def test_indexable_sitemap_matches_robots_and_canonical(self):
        ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls=[e.text for e in ET.parse(S/'sitemap.xml').findall('.//s:loc',ns)]
        self.assertEqual(len(urls),46); self.assertEqual(len(urls),len(set(urls)))
        for url in urls:
            p=S/urlsplit(url).path.lstrip('/')
            p=(p/'index.html') if p.is_dir() else p if p.exists() else p.with_suffix('.html')
            tags=Doc(p.read_text()).tags
            self.assertFalse(any(t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','') for t,a in tags),url)
            self.assertIn(('link',{'rel':'canonical','href':url}),tags)
        held=json.loads((R/'docs/INDEXABILITY_RC8.json').read_text())['held_routes']
        self.assertEqual(len(held),39)
        for route in held:
            self.assertNotIn('https://landerrio.com.br'+route,urls)
            self.assertRegex((S/route.lstrip('/')/'index.html').read_text(),r'name="robots" content="noindex,follow"')
    def test_structured_data_is_consistent_with_page(self):
        paths=list((S/'marcas').glob('*/index.html'))+[S/'marcas/index.html',S/'conteudos/index.html']
        paths += [S/'conteudos'/a['slug']/'index.html' for a in json.loads((R/'content/articles.json').read_text())['articles']]
        paths=[p for p in paths if p.parent.name!='alpha-laboratory']
        for p in paths:
            text=p.read_text(); url='https://landerrio.com.br/'+p.parent.relative_to(S).as_posix()+'/'
            blocks=re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S)
            self.assertTrue(blocks,str(p))
            nodes=[n for raw in blocks for n in json.loads(raw).get('@graph',[])]
            page=next(n for n in nodes if n['@type'] in ('WebPage','CollectionPage','Article'))
            self.assertEqual(page['url'],url)
            crumb=next(n for n in nodes if n['@type']=='BreadcrumbList')['itemListElement']
            self.assertEqual(crumb[-1]['item'],url)
            self.assertEqual([c['position'] for c in crumb],list(range(1,len(crumb)+1)))
            self.assertFalse(any(n['@type'] in ('Product','Offer','AggregateRating') for n in nodes))
    def test_approved_hero_photo_title_and_destinations_are_preserved(self):
        fixture=R/'docs/fixtures/rc9-approved-home.html'
        self.assertEqual(hashlib.sha256(fixture.read_bytes()).hexdigest(),'a9392ff31ec63f2542ab431af452ee36c796699c78dd2716fd889847bcd50618')
        before=fixture.read_text()
        after=(S/'index.html').read_text()
        extract=lambda s:re.search(r'<section\b[^>]*id="inicio"[^>]*>.*?</section>',s,re.S)[0]
        old,new=extract(before),extract(after)
        for pattern in [r'<picture.*?</picture>',r'<h1.*?</h1>']:
            self.assertEqual(re.search(pattern,old,re.S)[0],re.search(pattern,new,re.S)[0])
        self.assertEqual(re.findall(r'data-wa="[^"]*"',old),re.findall(r'data-wa="[^"]*"',new))
    def test_directory_without_javascript_has_all_destinations(self):
        text=(S/'marcas/index.html').read_text(); tags=Doc(text).tags
        cards=[a for t,a in tags if t=='a' and 'data-brand' in a]
        self.assertEqual(len(cards),14); self.assertTrue(all('hidden' not in a for a in cards))
        self.assertIn('data-enhanced hidden',text)
    def test_brands_are_unique_specific_and_sourced(self):
        brands=json.loads((R/'content/brands.json').read_text())['brands']
        self.assertEqual(len({b['slug'] for b in brands}),14)
        self.assertEqual(len({b['summary'] for b in brands}),14)
        self.assertEqual(sum(len(b['faqs']) for b in brands),43)
        for b in brands:
            if b['indexable']: self.assertTrue(b['sources'])
            self.assertGreaterEqual(len(b['knowledge']),1)
            page=(S/'marcas'/b['slug']/'index.html').read_text()
            for faq in b['faqs']: self.assertIn(faq['question'],page)
            self.assertNotRegex(page,r'https://wa.me|"@type"\s*:\s*"Offer"')
    def test_preview_harness_is_not_in_release(self):
        self.assertFalse((S/'__qa').exists())
if __name__=='__main__': unittest.main(verbosity=2)
