#!/usr/bin/env python3
"""Release contracts for the rebuilt homepage; no live integrations are called."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, parse_qs
import unittest, json
SITE=Path(__file__).resolve().parents[1]/'site'
class Parser(HTMLParser):
    def __init__(self): super().__init__(); self.tags=[]
    def handle_starttag(self,tag,attrs): self.tags.append((tag,dict(attrs)))
class Flagship(unittest.TestCase):
    @classmethod
    def setUpClass(c):
        c.html=(SITE/'index.html').read_text(); c.p=Parser(); c.p.feed(c.html)
        c.css=(SITE/'assets/flagship-2026.css').read_text();c.js=(SITE/'assets/flagship-2026.js').read_text()
    def test_document_semantics(self):
        self.assertEqual(sum(t=='h1' for t,a in self.p.tags),1)
        ids=[a['id'] for t,a in self.p.tags if 'id' in a];self.assertEqual(len(ids),len(set(ids)))
        for t,a in self.p.tags:
            if a.get('href','').startswith('#'):self.assertIn(a['href'][1:],ids)
            for key in ['aria-controls','aria-labelledby']:
                for id in a.get(key,'').split():self.assertIn(id,ids)
    def test_commercial_precedes_tools(self):
        order=['inicio','perfis','marcas','relacionamento','ferramentas','ciencia','atendimento']
        positions=[self.html.index('id="'+x+'"') for x in order];self.assertEqual(positions,sorted(positions))
    def test_whatsapp_profiles_and_safe_targets(self):
        links=[a for t,a in self.p.tags if t=='a' and 'data-wa' in a]
        self.assertGreaterEqual(len(links),3)
        hero=[a for a in links if a.get('data-placement')=='hero'];self.assertEqual({a.get('data-profile') for a in hero},{'atacado','varejo'})
        for a in links:
            u=urlsplit(a['href']);self.assertEqual(u.scheme,'https');self.assertEqual(u.netloc,'wa.me');self.assertEqual(u.path,'/5521920043538');self.assertIn('text',parse_qs(u.query));self.assertIn('noopener',a.get('rel',''))
        self.assertEqual(len({a['href'] for a in hero}),2)
    def test_original_routes_preserved(self):
        self.assertEqual(len(list(SITE.rglob('*.html'))),81)
        for x in ('treino','dieta','atacado','varejo','conteudos','enciclopedia','marcas','ferramentas','sobre','contato'):
            self.assertIn('href="/'+x+'/"',self.html);self.assertTrue((SITE/x/'index.html').is_file())
    def test_images_have_dimensions_and_local_sources(self):
        for t,a in self.p.tags:
            if t=='img':
                self.assertIn('alt',a);self.assertGreater(int(a['width']),0);self.assertGreater(int(a['height']),0)
                self.assertTrue((SITE/a['src'].lstrip('/')).is_file())
        self.assertLess((SITE/'assets/flagship-hero-mobile-v25.webp').stat().st_size,50_000)
        self.assertLess((SITE/'assets/flagship-hero-mobile-v25.avif').stat().st_size,50_000)
        self.assertIn('fetchpriority="high"',self.html)
    def test_brands_are_informational_and_not_checkout_links(self):
        brands=[a for t,a in self.p.tags if t=='a' and 'data-brand' in a];self.assertEqual(len(brands),18)
        self.assertTrue(all(urlsplit(a['href']).netloc=='' for a in brands))
        self.assertIn('não indicam parceria',self.html.lower())
    def test_progressive_enhancement_and_motion_fallback(self):
        self.assertGreater(self.html.index('<noscript>'),self.html.index('flagship-2026.css'))
        self.assertIn('@media(max-width:800px)',self.html)
        self.assertIn('prefers-reduced-motion:reduce',self.css);self.assertIn('saveData',self.js);self.assertIn(':focus-visible',self.css)
    def test_search_is_local_and_does_not_persist_input(self):
        self.assertIn('<dialog',self.html)
        for token in ('fetch(', 'XMLHttpRequest','localStorage','sessionStorage','innerHTML','eval('):self.assertNotIn(token,self.js)
        for token in ('@import','fonts.googleapis.com','cdnjs.cloudflare.com','unpkg.com'):self.assertNotIn(token,self.css+self.js)
    def test_rox_external_transport_stays_disabled(self):
        rox=(SITE/'assets/rox-demo-v25.js').read_text()
        for token in ('fetch(', 'XMLHttpRequest','localStorage','sessionStorage','eval('):self.assertNotIn(token,rox)
        self.assertIn('isDemo:true',rox)
    def test_release_manifest_covers_new_assets(self):
        manifest=json.loads((SITE/'manifest-digital-flagship-2026.json').read_text())
        for f in ('index.html','assets/flagship-2026.css','assets/flagship-2026.js','assets/flagship-hero-mobile-v25.avif','release.json'):self.assertIn(f,manifest['files'])
if __name__=='__main__':unittest.main(verbosity=2)

