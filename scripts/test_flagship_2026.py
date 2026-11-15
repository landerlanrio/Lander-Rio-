#!/usr/bin/env python3
"""Release contracts for the rebuilt homepage; no live integrations are called."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, parse_qs
import unittest, json, hashlib
SITE=Path(__file__).resolve().parents[1]/'site'
class Parser(HTMLParser):
    def __init__(self): super().__init__(); self.tags=[]
    def handle_starttag(self,tag,attrs): self.tags.append((tag,dict(attrs)))
class Flagship(unittest.TestCase):
    @classmethod
    def setUpClass(c):
        c.html=(SITE/'index.html').read_text(); c.p=Parser(); c.p.feed(c.html)
        c.css=(SITE/'assets/flagship-2026.css').read_text()+(SITE/'assets/flagship-reference-rc6.css').read_text();c.js=(SITE/'assets/flagship-reference-rc6.js').read_text()
    def test_document_semantics(self):
        self.assertEqual(sum(t=='h1' for t,a in self.p.tags),1)
        ids=[a['id'] for t,a in self.p.tags if 'id' in a];self.assertEqual(len(ids),len(set(ids)))
        for t,a in self.p.tags:
            if a.get('href','').startswith('#'):self.assertIn(a['href'][1:],ids)
            for key in ['aria-controls','aria-labelledby']:
                for id in a.get(key,'').split():self.assertIn(id,ids)
    def test_commercial_precedes_tools(self):
        order=['inicio','marcas','perfis','universo','ciencia','ferramentas','rox','atendimento']
        positions=[self.html.index('id="'+x+'"') for x in order];self.assertEqual(positions,sorted(positions))
    def test_whatsapp_profiles_and_safe_targets(self):
        links=[a for t,a in self.p.tags if t=='a' and 'data-wa' in a]
        self.assertGreaterEqual(len(links),3)
        hero=[a for a in links if a.get('data-placement')=='hero'];self.assertEqual({a.get('data-profile') for a in hero},{'atacado','varejo'})
        for a in links:
            u=urlsplit(a['href']);self.assertEqual(u.scheme,'https');self.assertEqual(u.netloc,'wa.me');self.assertEqual(u.path,'/5521920043538');self.assertIn('text',parse_qs(u.query));self.assertIn('noopener',a.get('rel',''))
        self.assertEqual(len({a['href'] for a in hero}),2)
    def test_original_routes_preserved(self):
        self.assertEqual(len(list(SITE.rglob('*.html'))),88)
        for x in ('treino','dieta','atacado','varejo','conteudos','enciclopedia','marcas','ferramentas','sobre','contato'):
            self.assertIn('href="/'+x+'/"',self.html);self.assertTrue((SITE/x/'index.html').is_file())
    def test_images_have_dimensions_and_local_sources(self):
        for t,a in self.p.tags:
            if t=='img':
                self.assertIn('alt',a);self.assertGreater(int(a['width']),0);self.assertGreater(int(a['height']),0)
                self.assertTrue((SITE/a['src'].lstrip('/')).is_file())
        self.assertLess((SITE/'assets/flagship-hero-mobile-rc2.webp').stat().st_size,120_000)
        self.assertLess((SITE/'assets/flagship-hero-mobile-rc2.avif').stat().st_size,120_000)
        self.assertIn('fetchpriority="high"',self.html)
    def test_hero_brand_logos_removed(self):
        logos=[a for t,a in self.p.tags if t=='img' and '-hero-rc5.webp' in a.get('src','')]
        self.assertEqual(len(logos),0)
    def test_selected_logo_set_is_complete_and_pinned(self):
        evidence=json.loads((SITE.parent/'docs/LOGOS_RC5_ASSETS.json').read_text())
        expected={a['slug'] for a in evidence['assets']}
        self.assertEqual(len(expected),14)
        logos=[a for t,a in self.p.tags if t=='img' and '/logos/' in a.get('src','')]
        self.assertEqual(len(logos),14)
        for asset in evidence['assets']:
            for output in asset['outputs']:
                content=(SITE/output['path']).read_bytes()
                self.assertEqual(hashlib.sha256(content).hexdigest(),output['sha256'])
                if output['role']=='hero':
                    continue
                match=[a for a in logos if a['src']=='/'+output['path']]
                self.assertEqual(len(match),1)
                self.assertEqual([int(match[0]['width']),int(match[0]['height'])],output['dimensions'])
        self.assertNotIn('labs-group-rc3.webp',self.html)
    def test_brands_are_informational_and_not_checkout_links(self):
        brands=[a for t,a in self.p.tags if t=='a' and 'data-brand' in a];self.assertEqual(len(brands),14)
        self.assertTrue(all(urlsplit(a['href']).netloc=='' for a in brands))
        self.assertIn('não indicam parceria',self.html.lower())
    def test_supplied_hero_has_portrait_and_landscape_fallbacks(self):
        sources=[a for t,a in self.p.tags if t=='source']
        mobile=[a for a in sources if a.get('media')=='(max-width:600px)']
        self.assertEqual({a.get('type','image/jpeg') for a in mobile},{'image/avif','image/webp','image/jpeg'})
        for a in mobile:
            self.assertIn('mobile-rc2',a['srcset']);self.assertEqual((a['width'],a['height']),('864','1536'))
        hero=[a for t,a in self.p.tags if t=='img' and 'hero-desktop-rc2' in a.get('src','')]
        self.assertGreaterEqual(len(hero),1);self.assertEqual((hero[0]['width'],hero[0]['height']),('1536','864'))
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
        manifest={'files':{}}
        for name in ('manifest-digital-flagship-2026.json','manifest-digital-flagship-2026-rc2.json','manifest-digital-flagship-2026-rc3.json','manifest-digital-flagship-2026-rc4.json','manifest-digital-flagship-2026-rc5.json','manifest-digital-flagship-2026-rc6.json'):
            manifest['files'].update(json.loads((SITE/name).read_text())['files'])
        for f in ('index.html','assets/flagship-2026.css','assets/flagship-2026.js','assets/flagship-hero-mobile-rc2.avif','release.json'):self.assertIn(f,manifest['files'])
if __name__=='__main__':unittest.main(verbosity=2)

