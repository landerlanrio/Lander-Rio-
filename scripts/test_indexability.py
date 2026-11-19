#!/usr/bin/env python3
"""Regression scenarios for accidental visibility and sitemap changes."""
import json
import tempfile
import unittest
from pathlib import Path
from urllib.robotparser import RobotFileParser
from audit_indexability import inspect, netlify_headers, audit


class Indexability(unittest.TestCase):
    def setUp(self):
        self.row = {'path': 'index.html', 'canonical': 'https://landerrio.com.br/', 'indexable': True}
        self.text = '<link rel="canonical" href="https://landerrio.com.br/"><meta name="robots" content="index,follow">'
        self.robots = RobotFileParser(); self.robots.parse(['User-agent: *', 'Allow: /'])

    def check_page(self, text=None, headers=None, row=None, sitemap=None, status=200, final_url=None):
        return inspect(row or self.row, text or self.text, headers or [], status,
                       self.robots, sitemap if sitemap is not None else {self.row['canonical']}, final_url)['errors']

    def test_baseline_is_allowed(self):
        self.assertEqual(self.check_page(), [])

    def test_noindex_injected_into_indexable_page_is_blocked(self):
        self.assertIn('unexpected_noindex', self.check_page(self.text + '<meta name="googlebot" content="NOINDEX">'))

    def test_none_directive_and_header_override_are_blocked(self):
        self.assertIn('unexpected_noindex', self.check_page(headers=['googlebot: none']))
        self.assertIn('unexpected_noindex', self.check_page(headers=['noindex, nofollow']))
        self.assertEqual(self.check_page(headers=['otherbot: noindex']), [])

    def test_intentional_noindex_cannot_be_removed(self):
        row = {**self.row, 'indexable': False}
        self.assertIn('intentional_noindex_removed', self.check_page(row=row, sitemap=set()))
        self.assertEqual(self.check_page(text=self.text.replace('index,follow', 'noindex,follow'), row=row, sitemap=set()), [])

    def test_canonical_and_redirect_changes_are_blocked(self):
        self.assertIn('canonical_mismatch', self.check_page(self.text.replace('landerrio.com.br/', 'landerrio.com.br/other/')))
        self.assertIn('unexpected_redirect', self.check_page(final_url='https://landerrio.com.br/other/'))

    def test_sitemap_and_http_failures_are_not_passes(self):
        self.assertIn('sitemap_policy_mismatch', self.check_page(sitemap=set()))
        self.assertIn('unexpected_http_status', self.check_page(status=503))

    def test_robots_block_is_detected(self):
        self.robots = RobotFileParser()
        self.robots.parse(['User-agent: *', 'Disallow: /'])
        self.assertIn('indexable_page_blocked_by_robots', self.check_page())

    def test_scoped_netlify_headers(self):
        text = '/*\n  X-Robots-Tag: googlebot: noindex\n/private/*\n  X-Robots-Tag: none\n'
        self.assertEqual(netlify_headers(text, '/'), ['googlebot: noindex'])
        self.assertEqual(netlify_headers(text, '/private/a'), ['googlebot: noindex', 'none'])

    def test_undeclared_pages_and_duplicate_sitemap_fail(self):
        with tempfile.TemporaryDirectory() as d:
            site = Path(d)
            (site / 'index.html').write_text(self.text)
            (site / 'new.html').write_text(self.text)
            (site / 'robots.txt').write_text('User-agent: *\nAllow: /\n')
            (site / '_headers').write_text('/*\n  X-Content-Type-Options: nosniff\n')
            (site / 'sitemap.xml').write_text('<urlset><url><loc>https://landerrio.com.br/</loc></url><url><loc>https://landerrio.com.br/</loc></url></urlset>')
            result = audit(site, {'origin': 'https://landerrio.com.br', 'baseline_commit': 'fixture', 'pages': [self.row]})
            self.assertEqual(result['status'], 'FAIL')
            self.assertEqual(len(result['errors']), 2)


if __name__ == '__main__':
    unittest.main(verbosity=2)
