"""Regression gates for recovered analytics, privacy and portable preview."""
import hashlib,json,re,tempfile,unittest
from pathlib import Path
from build_private_review import build
R=Path(__file__).resolve().parents[1];S=R/'site'
class RC10(unittest.TestCase):
 def test_google_bridge_matches_reconciled_production_or_versioned_replacement(self):
  production = json.loads((R/'docs/PRODUCTION_RECONCILIATION_RC10.json').read_text())
  expected_intent = production['ga4_intent_sha256']
  overlay_path = S/'manifest-digital-flagship-2026-rc14.1.json'
  if overlay_path.is_file():
   overlay = json.loads(overlay_path.read_text())
   self.assertEqual(overlay['replaces_sha256'], {'assets/ga4-intent.js': expected_intent})
   self.assertEqual(overlay['version'], 'digital-flagship-2026-rc14.1')
   expected_intent = overlay['files']['assets/ga4-intent.js']
   self.assertNotEqual(expected_intent, production['ga4_intent_sha256'])
  self.assertEqual(hashlib.sha256((S/'assets/ga4-config.js').read_bytes()).hexdigest(), production['ga4_config_sha256'])
  self.assertEqual(hashlib.sha256((S/'assets/ga4-intent.js').read_bytes()).hexdigest(), expected_intent)
 def test_google_scripts_are_singletons_and_ordered(self):
  tracked=[]
  for p in S.rglob('*.html'):
   s=p.read_text()
   if '/assets/ga4-intent.js' not in s:continue
   tracked.append(p)
   for n in ['measurement-v23-2','ga4-config','ga4-intent']:self.assertEqual(s.count('/assets/'+n+'.js'),1,str(p))
   self.assertLess(s.index('/assets/measurement-v23-2.js'),s.index('/assets/ga4-config.js'))
   self.assertLess(s.index('/assets/ga4-config.js'),s.index('/assets/ga4-intent.js'))
  self.assertEqual(len(tracked),51)
 def test_private_preview_strips_collection_and_stays_noindex(self):
  with tempfile.TemporaryDirectory() as d:
   build(Path(d))
   for p in Path(d).rglob('*.html'):
    s=p.read_text();self.assertNotRegex(s,r'<script[^>]+src="/assets/(ga4-|measurement-|performance-rc9)')
    self.assertIn('noindex,nofollow',s)
 def test_csp_preserves_only_captured_google_destinations(self):
  captured=json.loads((R/'docs/PRODUCTION_RECONCILIATION_RC10.json').read_text())['csp']
  self.assertIn('Content-Security-Policy: '+captured,(S/'_headers').read_text())
  self.assertNotIn("script-src *",captured);self.assertNotIn("'unsafe-eval'",captured)
 def test_article_reachable_sourced_and_has_no_sales_links(self):
  route='/conteudos/descanso-entre-series-hipertrofia/'
  for p in ['index.html','conteudos/index.html','sitemap.xml']:self.assertIn(route,(S/p).read_text())
  s=(S/route.lstrip('/')/'index.html').read_text()
  self.assertIn('10.3389/fspor.2024.1429789',s)
  self.assertIn('não estabelece um teto universal',s)
  self.assertNotIn('wa.me',s)
if __name__=='__main__':unittest.main(verbosity=2)
