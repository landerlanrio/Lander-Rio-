// Regression checks for pages with observed GSC demand. No production changes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../site');
const indexed = [
  'marcas/landerlan-gold', 'marcas/landerlan',
  'marcas/cooper-pharma', 'marcas/geniqs-pharma',
  'marcas/life-peptideos', 'marcas/muscle-labs-india',
  'treino', 'dieta'
];
test('priority organic landing pages preserve self-canonical and indexability', () => {
  for (const route of indexed) {
    const file = path.join(root, route, 'index.html');
    assert.ok(fs.existsSync(file), route + ': missing page');
    const html = fs.readFileSync(file, 'utf8');
    const canonical = 'https://landerrio.com.br/' + route + '/';
    assert.ok(html.includes('<link rel="canonical" href="' + canonical + '">'), route + ': canonical mismatch');
    assert.match(html, /<meta name="robots" content="index,follow">/, route + ': robots meta changed');
    assert.match(html, /<h1\b/i, route + ': missing H1');
  }
});
test('sitemap includes priority URLs and robots does not block the site', () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  for (const route of indexed) assert.ok(sitemap.includes('https://landerrio.com.br/' + route + '/'), route);
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m, 'global robots block');
});
test('intentional exclusions remain excluded', () => {
  const zphc = fs.readFileSync(path.join(root, 'marcas/zphc/index.html'), 'utf8');
  assert.match(zphc, /<meta name="robots" content="noindex,follow">/, 'ZPHC exclusion changed');
});
