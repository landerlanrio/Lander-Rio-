#!/usr/bin/env python3
"""Regression contracts for real, brand-specific destinations and attributed data."""
import json, re, unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
DATA=json.loads((ROOT/'content/brands.json').read_text())['brands']
class Document(HTMLParser):
    def __init__(self,text):super().__init__();self.tags=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
class Brands(unittest.TestCase):
    def test_every_gallery_card_reaches_its_own_brand(self):
        for path in ['index.html','marcas/index.html']:
            links=[a for t,a in Document((SITE/path).read_text()).tags if t=='a' and 'data-brand' in a]
            self.assertEqual(len(links),14);self.assertEqual(len({a['href'] for a in links}),14)
            for a in links:
                self.assertEqual(a['href'],'/marcas/'+a['data-brand']+'/')
                self.assertTrue((SITE/a['href'].lstrip('/')/'index.html').is_file())
    def test_all_original_routes_still_exist(self):
        original=json.loads((SITE/'manifest-v23-10.json').read_text())['files']
        for name in original:
            if name.endswith('.html'):self.assertTrue((SITE/name).is_file(),name)
    def test_profiles_match_their_brand_and_own_logo(self):
        for b in DATA:
            s=(SITE/'marcas'/b['slug']/'index.html').read_text();d=Document(s)
            self.assertIn('<h1 id="brand-title">'+b['name']+'</h1>',s)
            self.assertIn(b['image']['src'],s)
            self.assertEqual(sum(t=='h1' for t,a in d.tags),1)
            self.assertNotIn('Esta página mantém uma referência de navegação',s)
            self.assertNotIn('wa.me',s)
            ids=[a['id'] for t,a in d.tags if 'id' in a]
            self.assertEqual(len(ids),len(set(ids)))
            for t,a in d.tags:
                if a.get('href','').startswith('#'):self.assertIn(a['href'][1:],ids)
    def test_product_references_have_an_attributed_source(self):
        total=0
        for b in DATA:
            for p in b['products']:
                total+=1;self.assertGreaterEqual(p['source'],1);self.assertLessEqual(p['source'],len(b['sources']))
                self.assertEqual(urlsplit(b['sources'][p['source']-1]['url']).scheme,'https')
        self.assertEqual(total,62)
    def test_unknown_catalogs_are_explicit_and_not_conflated(self):
        pending={b['slug'] for b in DATA if not b['products']}
        self.assertEqual(pending,{'zphc','alpha-x-prime','synedica'})
        for slug in pending:self.assertIn('Catálogo em verificação',(SITE/'marcas'/slug/'index.html').read_text())
    def test_logo_binary_provenance_is_unchanged(self):
        import hashlib
        evidence=json.loads((ROOT/'docs/LOGOS_RC5_ASSETS.json').read_text())
        for asset in evidence['assets']:
            for output in asset['outputs']:
                self.assertEqual(hashlib.sha256((SITE/output['path']).read_bytes()).hexdigest(),output['sha256'])
    def test_new_routes_are_in_sitemap(self):
        s=(SITE/'sitemap.xml').read_text()
        for b in DATA:self.assertEqual(('https://landerrio.com.br/marcas/'+b['slug']+'/') in s,b['indexable'])
if __name__=='__main__':unittest.main(verbosity=2)
