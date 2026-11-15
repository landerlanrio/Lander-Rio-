// Regression: review attachments must be useful when scripts/iframes do not run.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const file = process.argv[2];
assert.ok(file, 'Pass the exported PREVIEW.html path');
const html = fs.readFileSync(file, 'utf8');
const root = path.resolve(__dirname, '..');
const review = JSON.parse(fs.readFileSync(path.join(root, 'docs/PRIVATE_REVIEW_RC6.3.json'), 'utf8'));
const brands = JSON.parse(fs.readFileSync(path.join(root, 'docs/BRAND_PROFILES_RC6.3.json'), 'utf8')).brands;
const checks = [
  ['No JavaScript or nested browsing context', () => assert.ok(!/<(?:iframe|script|embed|object)\b/i.test(html))],
  ['Immediate visible navigation in HTML', () => assert.match(html, /<a class="open-preview" href="https:\/\/[^"]+">Abrir preview navegável/)],
  ['Exact verified private origin', () => assert.ok(html.includes(`href="${review.url}"`) && review.status === 'succeeded')],
  ['14 separate real brand routes', () => { const links = [...html.matchAll(/<li><a href="([^"]+)">/g)].map(m => m[1]); assert.equal(new Set(links).size, 14); for (const brand of brands) assert.ok(links.includes(`${review.url}/marcas/${brand.slug}/`)); }],
  ['Two self-contained real screenshots', () => { const images = [...html.matchAll(/src="data:image\/jpeg;base64,([^"]+)"/g)]; assert.equal(images.length, 2); for (const m of images) assert.equal(Buffer.from(m[1], 'base64').subarray(0,2).toString('hex'), 'ffd8'); }],
  ['Access and scope disclosed', () => { assert.ok(html.includes('Acesso privado pela sua conta do ChatGPT')); assert.ok(html.includes('não foi alterado')); }],
];
for (const [name, check] of checks) { check(); console.log('PASS', name); }
console.log(`${checks.length}/${checks.length} preview regression checks passed`);
