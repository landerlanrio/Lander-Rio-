const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const site = path.join(root, 'site');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('the hero has legible, differentiated commercial paths and an honest handoff', () => {
  const home = read('site/index.html');
  const css = read('site/assets/enciclopedia-home.css');
  assert.equal((home.match(/class="lr-hero-handoff"/g) || []).length, 1);
  assert.match(home, /a mensagem pronta só é enviada se você confirmar/i);
  const hero = home.slice(home.indexOf('<div class="lfx-hero-actions">'), home.indexOf('</div>', home.indexOf('<div class="lfx-hero-actions">')));
  assert.equal((hero.match(/class="[^"]*hero-cta/g) || []).length, 2);
  assert.match(hero, /data-profile="atacado"/);
  assert.match(hero, /data-profile="varejo"/);
  assert.match(hero, /href="\/atacado\/"/);
  assert.match(hero, /href="\/varejo\/"/);
  assert.doesNotMatch(hero, /data-wa|wa\.me|target="_blank"/);
  assert.match(css, /LANDER RIO RC14\.3/);
  assert.match(css, /font-size:\s*13px!important/);
  assert.match(css, /min-height:\s*56px!important/);
});

test('14 curated brands navigate to real educational pages, not a checkout', () => {
  const home = read('site/index.html');
  const brands = [...home.matchAll(/<a href="(\/marcas\/[^"]+)" class="lfx-brand-tile"/g)].map(m => m[1]);
  assert.equal(brands.length, 14);
  assert.equal(new Set(brands).size, 14);
  for (const url of brands) {
    assert.ok(fs.existsSync(path.join(site, url, 'index.html')), url);
  }
  assert.match(home, /As marcas não indicam parceria oficial, oferta ou disponibilidade/);
});

test('the editorial addition retains its 12 cadernos and navigable indexes', () => {
  const dir = path.join(site, 'enciclopedia/cadernos');
  const dirs = fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory());
  assert.equal(dirs.length, 12);
  for (const d of dirs) assert.ok(fs.existsSync(path.join(dir, d.name, 'index.html')));
  for (const route of ['/enciclopedia/guias/', '/enciclopedia/cadernos/', '/enciclopedia/']) {
    assert.ok(fs.existsSync(path.join(site, route, 'index.html')), route);
  }
});

test('commercial measurement records a click, not a completed conversation', () => {
  const commerce = read('site/assets/commerce-v21.js');
  const measurement = read('site/assets/measurement-v23-2.js');
  const ga4 = read('site/assets/ga4-intent.js');
  assert.match(commerce, /whatsapp_open_click/);
  assert.match(measurement, /'whatsapp_open_click'/);
  assert.match(ga4, /window\.LanderMeasurement\?\.isEnabled\(\)===true/);
  assert.match(ga4, /if\(event==='utility_registration_confirmed'\)event='generate_lead'/);
  assert.doesNotMatch(ga4, /if\(event==='whatsapp_open_click'\)event='generate_lead'/);
});

test('site conversion remains privacy-conscious and separates the commerce preview', () => {
  const home = read('site/index.html');
  assert.match(home, /data-privacy-open/);
  assert.doesNotMatch(home, /lander-rio-commerce-preview\.netlify\.app/);
  assert.doesNotMatch(home, /checkout|comprar agora|finalizar compra/i);
});
