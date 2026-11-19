#!/usr/bin/env python3
"""LANDER RIO v26 — source-backed HTML/asset/privacy regression gates."""
from __future__ import annotations
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import unittest, re, json
ROOT=Path(__file__).resolve().parent.parent
SITE=ROOT/'site'
class Parser(HTMLParser):
    def __init__(self):super().__init__();self.tags=[];self.ids=[];self.h1=0
    def handle_starttag(self,tag,attrs):
        d=dict(attrs);self.tags.append((tag,d));
        if d.get('id'):self.ids.append(d['id'])
        if tag=='h1':self.h1+=1
class ReferenceDesignTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text=(SITE/'index.html').read_text(encoding='utf-8')
        cls.css=(SITE/'assets/flagship-v26-reference.css').read_text(encoding='utf-8')
        cls.js=(SITE/'assets/brand-vault-v26.js').read_text(encoding='utf-8')
        cls.rox=(SITE/'assets/rox-demo-v25.js').read_text(encoding='utf-8')
        cls.parser=Parser();cls.parser.feed(cls.text)
    def test_h1_exact(self):
        self.assertEqual(self.parser.h1,1)
        self.assertIn('CULTURA DE<br><em>PERFORMANCE.</em>',self.text)
    def test_hero_image(self):
        p=SITE/'assets/flagship-hero-mobile-v25.webp';self.assertTrue(p.is_file());self.assertLess(p.stat().st_size,150_000)
        self.assertIn('flagship-hero-mobile-v25.webp',self.text)
        self.assertIn('fetchpriority="high"',self.text)
    def test_hero_photo_has_source_dimensions(self):
        self.assertRegex(self.text,r'flagship-hero-v25\.webp" width="1536" height="1024"')
    def test_v26_styles_and_script(self):
        self.assertIn('flagship-v26-reference.css',self.text)
        self.assertIn('brand-vault-v26.js',self.text)
        self.assertIn('prefers-reduced-motion:reduce',self.css)
        self.assertIn('@media(max-width:600px)',self.css)
    def test_brand_count(self):
        self.assertEqual(self.text.count('class="v26-brand-card"'),14)
    def test_filter_controls_five(self):
        self.assertEqual(len(re.findall('data-v26-filter="',self.text)),5)
        for key in ('todas','hormonios','peptideos','performance','outros'):
            self.assertIn('data-v26-filter="'+key+'"',self.text)
    def test_filter_boolean_accessibility(self):
        self.assertIn('aria-pressed="true"',self.text)
        self.assertIn("btn.setAttribute('aria-pressed',String(active))",self.js)
        self.assertIn('aria-live="polite"',self.text)
    def test_labels_come_from_real_existing_files(self):
        for tag,attrs in self.parser.tags:
            if tag=='img' and attrs.get('src','').startswith('/assets/logos/'):
                self.assertTrue((SITE/attrs['src'].lstrip('/')).is_file(),attrs['src'])
    def test_no_fake_commercial_claims(self):
        for phrase in ('250.000+','4,9/5','60+ países','12+ anos de expertise','100% de resultado'):
            self.assertNotIn(phrase,self.text)
    def test_disclaimer_present(self):
        for fragment in ('Diretório informativo','não representam vínculo oficial','disponibilidade'):
            self.assertIn(fragment,self.text)
    def test_real_whatsapp_link(self):
        links=[a for t,a in self.parser.tags if t=='a' and 'data-wa' in a]
        self.assertGreaterEqual(len(links),3)
        for a in links:
            self.assertEqual(urlsplit(a.get('href','')).hostname,'wa.me')
            self.assertIn('noopener',a.get('rel',''))
    def test_wa_placement(self):
        self.assertIn('class="v26-whatsapp"',self.text)
        self.assertIn('Falar no WhatsApp com a Equipe',self.text)
    def test_commercial_routes_differ(self):
        for key in ('atacado','varejo'):
            self.assertIn('data-profile="'+key+'"',self.text)
            self.assertIn('href="/'+key+'/"',self.text)
    def test_all_original_routes(self):
        for x in ('/treino/','/dieta/','/atacado/','/varejo/','/conteudos/','/enciclopedia/','/marcas/','/ferramentas/','/sobre/','/contato/'):
            self.assertIn('href="'+x+'"',self.text)
            self.assertTrue((SITE/x.lstrip('/')/'index.html').is_file())
    def test_existing_tools_not_replaced(self):
        self.assertIn('id="profile-select"',self.text)
        self.assertIn('id="message-preview"',self.text)
        self.assertIn('measurement-v23-2.js',self.text)
    def test_hero_before_brand_and_commercial(self):
        self.assertLess(self.text.index('id="inicio"'),self.text.index('id="marcas"'))
        self.assertLess(self.text.index('id="marcas"'),self.text.index('id="perfis"'))
    def test_semantic_navigation_and_unique_ids(self):
        self.assertEqual(len(self.parser.ids),len(set(self.parser.ids)))
        for x in ('conteudo','inicio','marcas','perfis','ferramentas','ciencia','main-nav','v26-title','v26-search'):
            self.assertIn(x,self.parser.ids)
    def test_search_accessible(self):
        for phrase in ('aria-label="Abrir busca"','aria-controls="v26-search"','aria-label="Fechar busca"'):
            self.assertIn(phrase,self.text)
        self.assertIn('Escape',self.js)
    def test_search_no_external_index(self):
        for phrase in ('fetch(', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'innerHTML','eval('):
            self.assertNotIn(phrase,self.js)
    def test_no_external_new_assets(self):
        for phrase in ('@import','fonts.googleapis.com','unsplash.com','cdnjs.cloudflare.com','unpkg.com'):
            self.assertNotIn(phrase,self.css+self.js)
    def test_image_urls_resolve(self):
        for tag,attrs in self.parser.tags:
            if tag=='img' and attrs.get('src','').startswith('/'):
                self.assertTrue((SITE/attrs['src'].lstrip('/')).is_file(),attrs['src'])
    def test_official_lockup(self):
        self.assertIn('lander-rio-lockup-v25.webp',self.text)
        self.assertTrue((SITE/'assets/lander-rio-lockup-v25.webp').is_file())
    def test_rox_kept_offline(self):
        for phrase in ('fetch(', 'XMLHttpRequest','localStorage','sessionStorage','eval('):
            self.assertNotIn(phrase,self.rox)
        self.assertIn('isDemo:true',self.rox)
    def test_accessibility_focus(self):
        self.assertIn(':focus-visible',self.css)
        self.assertIn('aria-labelledby="v26-vault-title"',self.text)
    def test_legacy_html_pages_unchanged_count(self):
        self.assertEqual(len(list(SITE.rglob('*.html'))),81)
    def test_original_81_pages_and_others_preserved(self):
        for p in ('treino/index.html','dieta/index.html','enciclopedia/index.html','atacado/index.html','varejo/index.html','_headers','_redirects'):
            self.assertTrue((SITE/p).is_file())
    def test_sitemap_robots_present(self):
        self.assertTrue((SITE/'robots.txt').exists())
        self.assertTrue((SITE/'sitemap.xml').exists())
    def test_no_secrets_in_new_code(self):
        self.assertNotRegex(self.css+self.js,r'(sk-proj-|ghp_[A-Za-z0-9]{24}|-----BEGIN PRIVATE KEY)')
    def test_manifest_contains_new_files(self):
        obj=json.loads((SITE/'manifest-flagship-v25.json').read_text(encoding='utf8'))
        for f in ('index.html','assets/v26-hero-reference.webp','assets/flagship-v26-reference.css','assets/brand-vault-v26.js'):
            self.assertIn(f,obj['files'])
if __name__=='__main__':unittest.main(verbosity=2)
