'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const paths = [
  'site/treino/index.html',
  'site/conteudos/como-organizar-semana-treino/index.html',
  'site/conteudos/planejar-compras-refeicoes-semana/index.html',
  'site/atacado/index.html'
];
for (const path of paths) {
  const html = fs.readFileSync(path, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = html.match(/<meta\s+content="([^"]*)"\s+name="description"\s*\/>/i)?.[1];
  assert.ok(title, path + ': title missing');
  assert.ok(description, path + ': description missing');
  assert.ok(title.length <= 60, path + ': title too long (' + title.length + ')');
  assert.ok(description.length <= 160, path + ': description too long (' + description.length + ')');
  assert.match(html, /rel="canonical"/i, path + ': missing canonical');
  assert.match(html, /<h1\b/i, path + ': missing H1');
  console.log('PASS', path, 'title=', title.length, 'description=', description.length);
}
console.log('SEO metadata QA: 4/4 pages validated.');
