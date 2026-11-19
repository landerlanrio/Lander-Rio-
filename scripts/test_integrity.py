#!/usr/bin/env python3
"""Prevent recurrence of manifest, binary and SEO defects across all routes."""
import hashlib, json, tempfile, unittest, re
from pathlib import Path
from html.parser import HTMLParser
import verify_site as v
class Meta(HTMLParser):
    def __init__(self):super().__init__();self.in_title=False;self.title='';self.description=[];self.canonical=[];self.headings=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='title':self.in_title=True
        if tag=='meta' and a.get('name')=='description':self.description.append(a.get('content',''))
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href',''))
        if re.fullmatch('h[1-6]',tag):self.headings.append(int(tag[1]))
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
    def handle_data(self,text):
        if self.in_title:self.title+=text
class Integrity(unittest.TestCase):
    def test_binary_webp_does_not_enter_text_secret_scanner(self):
        original=v.SITE
        with tempfile.TemporaryDirectory() as d:
            try:
                v.SITE=Path(d);(v.SITE/'photo.webp').write_bytes(b'RIFF\xff\xfeWEBP\x80');v.ISSUES.clear();v.verify_credentials();self.assertEqual(v.ISSUES,[])
            finally:v.SITE=original
    def test_overlay_checks_bytes_and_does_not_bless_tampering(self):
        original=v.SITE
        with tempfile.TemporaryDirectory() as d:
            try:
                v.SITE=Path(d);content=b'original';(v.SITE/'a.js').write_bytes(content)
                manifest={'files':{'a.js':hashlib.sha256(content).hexdigest()}}
                (v.SITE/'manifest-v23-10.json').write_text(json.dumps(manifest));v.ISSUES.clear();v.verify_manifest();self.assertEqual(v.ISSUES,[])
                (v.SITE/'a.js').write_bytes(b'tampered');v.ISSUES.clear();v.verify_manifest();self.assertIn(('hash-mismatch','a.js'),v.ISSUES)
                (v.SITE/'new.webp').write_bytes(b'RIFF');v.ISSUES.clear();v.verify_manifest();self.assertIn(('untracked','new.webp'),v.ISSUES)
            finally:v.SITE=original;v.ISSUES.clear()
    def test_all_81_pages_have_unique_metadata_and_ordered_headings(self):
        titles=[];canonicals=[]
        pages=sorted(v.SITE.rglob('*.html'));self.assertEqual(len(pages),81)
        for f in pages:
            with self.subTest(page=f.relative_to(v.SITE).as_posix()):
                p=Meta();p.feed(f.read_text());self.assertTrue(0<len(p.title)<=60,p.title)
                self.assertEqual(len(p.description),1);self.assertTrue(0<len(p.description[0])<=160)
                self.assertEqual(len(p.canonical),1);self.assertTrue(p.canonical[0].startswith('https://landerrio.com.br/'))
                self.assertEqual(p.headings.count(1),1)
                self.assertFalse(any(b>a+1 for a,b in zip(p.headings,p.headings[1:])))
                titles.append(p.title);canonicals.extend(p.canonical)
        self.assertEqual(len(titles),len(set(titles)));self.assertEqual(len(canonicals),len(set(canonicals)))
if __name__=='__main__':unittest.main(verbosity=2)
