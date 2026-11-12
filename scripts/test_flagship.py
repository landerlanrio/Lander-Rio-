#!/usr/bin/env python3
"""LANDER RIO v25: source-backed integrity, accessibility and routing checks."""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
import json,re,hashlib,unittest
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parent.parent
SITE=ROOT/'site'
class Parse(HTMLParser):
    def __init__(self):super().__init__();self.tags=[];self.ids=[];self.h1=0
    def handle_starttag(self,tag,attrs):
        d=dict(attrs);self.tags.append((tag,d));
        if d.get('id'):self.ids.append(d['id'])
        if tag=='h1':self.h1+=1
class FlagshipV25(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html=(SITE/'index.html').read_text(encoding='utf-8')
        cls.css=(SITE/'assets/flagship-v25.css').read_text(encoding='utf-8')
        cls.js=(SITE/'assets/rox-demo-v25.js').read_text(encoding='utf-8')
        cls.parser=Parse();cls.parser.feed(cls.html)
    def test_single_h1(self):self.assertEqual(self.parser.h1,1)
    def test_headline(self):self.assertRegex(self.html,r'PERFORMANCE</span><span>IS <em>CULTURE\.</em>')
    def test_semantic_navigation(self):
        for id in ['conteudo','inicio','ecossistema','ciencia','ferramentas','perfis','main-nav','flagship-title']:
            self.assertIn(id,self.parser.ids)
    def test_ids_unique(self):self.assertEqual(len(self.parser.ids),len(set(self.parser.ids)))
    def test_metadata_consistency(self):
        self.assertIn('Performance is Culture',self.html)
        title=re.search(r'<title>(.*?)</title>',self.html,re.S).group(1)
        self.assertIn(title,self.html[self.html.index('property="og:title"')-230:self.html.index('property="og:title"')])
        self.assertIn('https://landerrio.com.br/',self.html)
    def test_no_fake_metrics(self):
        for x in ['250.000+','4,9/5','60+ países','100% de resultado','12+ anos de expertise']:
            self.assertNotIn(x,self.html)
    def test_hero_uses_local_images(self):
        for path in ['flagship-hero-v25.webp','flagship-hero-mobile-v25.webp']:
            p=SITE/'assets'/path;self.assertTrue(p.is_file());self.assertLess(p.stat().st_size,130_000)
        self.assertIn('fetchpriority="high"',self.html)
        self.assertIn('width="1536" height="1024"',self.html)
    def test_official_lockup(self):
        self.assertTrue((SITE/'assets/lander-rio-lockup-v25.webp').is_file())
        self.assertIn('class="v25-lockup"',self.html)
        self.assertIn('alt="LANDER RIO — PERFORMANCE CULTURE"',self.html)
    def test_four_paths(self):
        for x in ('/treino/','/dieta/','/conteudos/','/atacado/'):
            self.assertIn('href="'+x+'"',self.html)
    def test_legacy_paths_present(self):
        for x in ('/varejo/','/contato/','/sobre/','/enciclopedia/'):
            self.assertIn('href="'+x+'"',self.html)
            self.assertTrue((SITE/x.lstrip('/')/'index.html').exists())
    def test_tools_untouched(self):
        self.assertTrue((SITE/'dieta/index.html').is_file())
        self.assertTrue((SITE/'treino/index.html').is_file())
        self.assertIn('id="profile-select"',self.html)
        self.assertIn('id="message-preview"',self.html)
    def test_brand_directory_unchanged(self):self.assertEqual(self.html.count('class="brand-card"'),14)
    def test_brand_below_primary_paths(self):
        self.assertLess(self.html.index('id="ecossistema"'),self.html.index('id="marcas"'))
    def test_no_inline_secret_in_new_files(self):
        self.assertNotRegex(self.css+self.js,r'(sk-proj-|ghp_[A-Za-z0-9]{24}|-----BEGIN PRIVATE KEY)')
    def test_rox_offline_only(self):
        for forbidden in ('fetch(', 'XMLHttpRequest(', 'localStorage', 'sessionStorage', 'innerHTML', 'eval('):
            self.assertNotIn(forbidden,self.js)
        self.assertIn('isDemo:true',self.js)
    def test_rox_accessible(self):
        for x in ('aria-controls="v25-rox-dialog"','role="dialog"','aria-modal="false"','aria-live="polite"','data-rox-close'):
            self.assertIn(x,self.html)
        self.assertIn("e.key==='Escape'",self.js)
    def test_rox_handoff_consent(self):
        self.assertIn('data-rox-handoff',self.html)
        self.assertIn("'https://wa.me/'+WA+'?text='+encodeURIComponent",self.js)
        self.assertNotIn('window.open(',self.js)
    def test_keyboard_focus(self):
        self.assertIn(':focus-visible',self.css)
        self.assertIn('returnTo.focus(',self.js)
    def test_responsive(self):
        for s in ('@media(max-width:350px)','@media(max-width:600px)','@media(max-width:1050px)','prefers-reduced-motion:reduce'):
            self.assertIn(s,self.css)
    def test_no_remote_assets(self):
        for d in ('cdnjs.cloudflare.com','fonts.googleapis.com','unsplash.com','googleapis.com','unpkg.com'):
            self.assertNotIn(d,self.css+self.js)
    def test_consent_script_preserved(self):self.assertIn('measurement-v23-2.js',self.html)
    def test_local_images_all_resolve(self):
        for tag,attrs in self.parser.tags:
            if tag!='img':continue
            src=attrs.get('src','')
            if src.startswith('/'):self.assertTrue((SITE/src.lstrip('/')).exists(),src)
    def test_css_self_contained(self):
        self.assertNotIn('@import',self.css)
        self.assertLess((SITE/'assets/flagship-v25.css').stat().st_size,32_000)
    def test_whatsapp_ctas_only_user_action(self):
        for tag,attrs in self.parser.tags:
            if tag=='a' and 'data-wa' in attrs:
                self.assertEqual(urlsplit(attrs.get('href','')).hostname,'wa.me')
                self.assertIn('noopener',attrs.get('rel',''))
    def test_legacy_80_pages_preserved(self):self.assertEqual(len(list(SITE.rglob('*.html'))),81)
if __name__=='__main__':unittest.main(verbosity=2)
