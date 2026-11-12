#!/usr/bin/env python3
"""Static regression gates for the isolated LANDER RIO flagship homepage."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from urllib.parse import urlsplit, parse_qs

ROOT=Path(__file__).resolve().parent.parent
SITE=ROOT/'site'

class Inspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags=[]
        self.links=[]
        self.h1=0
        self.ids=[]
        self.images=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        self.tags.append((tag,a))
        if a.get('id'): self.ids.append(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='a': self.links.append(a)
        if tag=='img': self.images.append(a)

class FlagshipTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.home=(SITE/'index.html').read_text(encoding='utf-8')
        cls.css=(SITE/'assets/flagship-v24.css').read_text(encoding='utf-8')
        cls.rox=(SITE/'assets/rox-demo-v24.js').read_text(encoding='utf-8')
        cls.headers=(SITE/'_headers').read_text(encoding='utf-8')
        cls.doc=Inspector()
        cls.doc.feed(cls.home)
    def test_single_meaningful_h1(self):
        self.assertEqual(self.doc.h1,1)
        self.assertIn('PERFORMANCE',self.home)
        self.assertIn('IS <em>CULTURE.</em>',self.home)
    def test_editorial_before_commercial_directory(self):
        self.assertLess(self.home.index('class="hero flagship-hero"'),self.home.index('id="marcas"'))
    def test_original_journeys_preserved(self):
        for route in ('/treino/','/dieta/','/atacado/','/varejo/','/conteudos/','/enciclopedia/','/contato/','/privacidade'):
            self.assertTrue(any((a.get('href') or '').startswith(route) for a in self.doc.links),route)
    def test_existing_conversion_and_measurement(self):
        for marker in ('id="profile-select"','id="message-preview"','measurement-v23-2.js','commerce-v21.js'):
            self.assertIn(marker,self.home)
    def test_existing_fourteen_brand_tiles(self):
        self.assertEqual(self.home.count('class="brand-card"'),14)
    def test_whatsapp_only_explicit_visit(self):
        links=[a for a in self.doc.links if 'data-wa' in a or 'data-wa-web' in a]
        self.assertGreaterEqual(len(links),3)
        for link in links:
            self.assertIn('noopener',link.get('rel',''))
            self.assertIn('noreferrer',link.get('rel',''))
            if 'data-wa' in link:
                self.assertEqual(urlsplit(link['href']).hostname,'wa.me')
        self.assertNotIn("window.open(",self.rox)
    def test_hero_image_render_and_lcp_hints(self):
        photo=[i for i in self.doc.images if '/training-1200-v20.webp' in i.get('src','')]
        self.assertEqual(len(photo),1)
        self.assertEqual(photo[0].get('fetchpriority'),'high')
        self.assertTrue(int(photo[0].get('width','0'))>0)
        self.assertTrue(int(photo[0].get('height','0'))>0)
        self.assertTrue(photo[0].get('alt',''))
    def test_accessible_rox_controls(self):
        for marker in ('data-rox-launcher','aria-expanded="false"','aria-controls="lr-chat-panel"',
                       'role="dialog"','aria-modal="false"','role="log"','aria-live="polite"',
                       'aria-label="Sua pergunta para o ROX"'):
            self.assertIn(marker,self.home)
        self.assertIn("event.key==='Escape'",self.rox)
    def test_rox_honest_offline_and_private(self):
        self.assertIn('demonstração offline',self.home)
        for unsafe in ('fetch(', 'localStorage', 'sessionStorage', 'XMLHttpRequest', 'innerHTML', 'eval('):
            self.assertNotIn(unsafe,self.rox)
        self.assertIn('encodeURIComponent(message)',self.rox)
        self.assertIn('não',self.rox.lower())
    def test_mobile_and_reduced_motion(self):
        self.assertIn('@media(max-width:600px)',self.css)
        self.assertIn('prefers-reduced-motion:reduce',self.css)
        self.assertIn('100dvh',self.css)
        self.assertIn('min-height:50px',self.css)
    def test_no_paid_runtime_dependency(self):
        for domain in ('cdnjs.cloudflare.com','fonts.googleapis.com','openai.com','unpkg.com'):
            self.assertNotIn(domain,self.css+self.rox)
        self.assertIn("script-src 'self'",self.headers)
        self.assertIn("img-src 'self' data:",self.headers)
    def test_document_metadata(self):
        self.assertIn('rel="canonical"',self.home)
        self.assertIn('name="description"',self.home)
        self.assertIn('property="og:title"',self.home)
    def test_unique_identifiers(self):
        self.assertEqual(len(self.doc.ids),len(set(self.doc.ids)))
    def test_no_change_to_critical_urls(self):
        self.assertTrue((SITE/'treino/index.html').exists())
        self.assertTrue((SITE/'dieta/index.html').exists())
        self.assertTrue((SITE/'enciclopedia/index.html').exists())
        self.assertTrue((SITE/'_redirects').exists())

if __name__=='__main__':
    unittest.main(verbosity=2)
