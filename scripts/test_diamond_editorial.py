#!/usr/bin/env python3
"""Guard the distinctions that public product pages do and do not establish."""
import hashlib, json, re, unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
EVIDENCE=json.loads((ROOT/'content/diamond-gold-evidence.json').read_text())
PAGE=(SITE/'marcas/landerlan/index.html').read_text()

class Document(HTMLParser):
    def __init__(self,text):super().__init__();self.tags=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))

class Editorial(unittest.TestCase):
    def test_six_references_have_individual_primary_sources(self):
        products=EVIDENCE['products']
        self.assertEqual(len(products),EVIDENCE['listing_count'])
        self.assertEqual(len({p['url'] for p in products}),6)
        self.assertEqual(PAGE.count('data-diamond-reference='),6)
        for p in products:
            self.assertIn(p['url'],PAGE)
            self.assertIn(p['name'],PAGE)
            self.assertIn(p['presentation'],PAGE)
            self.assertIn(p['strength'],PAGE)
            self.assertTrue(p['url'].startswith('https://landerpharma.com.py/productos/'))

    def test_carrier_uncertainty_cannot_be_replaced_with_a_line_wide_claim(self):
        named=[p for p in EVIDENCE['products'] if p['oil']]
        unknown=[p for p in EVIDENCE['products'] if p['oil_status']=='not_named_in_public_page']
        self.assertEqual([p['name'] for p in named],['Durateston Plus'])
        self.assertEqual(len(unknown),5)
        self.assertEqual(PAGE.count('Veículo: não identificado pelo nome na página consultada.'),5)
        self.assertIn('As páginas consultadas não informam suas proporções',PAGE)
        self.assertNotIn('óleo de coco',PAGE)

    def test_comparator_is_bounded_to_durateston_plus(self):
        diamond=EVIDENCE['products'][0]
        gold=EVIDENCE['gold_comparator']
        self.assertEqual(diamond['oil'],gold['oil'])
        self.assertEqual(diamond['other_named_excipient'],gold['other_named_excipient'])
        self.assertIn('Durateston Plus: o par que permite comparar o veículo',PAGE)
        self.assertIn('nomes iguais não comprovam formulações integralmente idênticas',PAGE)

    def test_source_url_typoes_do_not_change_the_presentation(self):
        products={p['name']:p for p in EVIDENCE['products']}
        self.assertEqual(products['Testoland Depot']['presentation'],'10 ampolas de 2 mL')
        self.assertEqual(products['Testoland Depot']['strength'],'200 mg/2 mL')
        self.assertEqual(products['Testenat Depot']['presentation'],'10 ampolas de 1 mL')

    def test_page_anchors_metadata_and_schema(self):
        d=Document(PAGE);ids=[a['id'] for _,a in d.tags if 'id' in a]
        self.assertEqual(len(ids),len(set(ids)))
        self.assertEqual(sum(t=='h1' for t,_ in d.tags),1)
        self.assertEqual([a['href'] for t,a in d.tags if t=='link' and a.get('rel')=='canonical'],['https://landerrio.com.br/marcas/landerlan/'])
        for _,a in d.tags:
            if a.get('href','').startswith('#'):self.assertIn(a['href'][1:],ids)
        for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',PAGE,re.S):
            data=json.loads(raw)
            self.assertNotRegex(json.dumps(data),r'"(?:Offer|Product|AggregateRating)"')
            for item in data.get('@graph',[]):
                if item.get('@type')=='WebPage':self.assertEqual(item['dateModified'],'2026-11-15')

    def test_neutral_illustration_and_no_commercial_handoff(self):
        self.assertIn('Ilustração conceitual gerada por IA',PAGE)
        self.assertNotIn('wa.me',PAGE)
        self.assertNotRegex(PAGE.lower(),r'comprar|peça sua|garanta já|mais seguro|sem colaterais|melhor absorção|menos dor|r\$')
        asset=SITE/'assets/editorial/composicao-vidro-rc14.webp'
        self.assertLess(asset.stat().st_size,120_000)
        self.assertEqual(asset.read_bytes()[:4],b'RIFF')
        image=next(a for t,a in Document(PAGE).tags if t=='img' and 'composicao-vidro' in a.get('src',''))
        self.assertEqual((image['width'],image['height']),('1672','941'))
        self.assertEqual(image.get('loading'),'lazy')

    def test_prior_manifest_bytes_are_preserved(self):
        original=ROOT.parent.parent/'seo-organic-work/lander-rio/site'
        # If the original local candidate is available, compare immutable manifests.
        if not original.is_dir():self.skipTest('Historic hashes are checked by verify_site instead')
        for path in original.glob('manifest*.json'):
            self.assertEqual(hashlib.sha256(path.read_bytes()).digest(),hashlib.sha256((SITE/path.name).read_bytes()).digest(),path.name)

if __name__=='__main__':unittest.main(verbosity=2)
