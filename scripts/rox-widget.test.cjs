'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const api=require('../site/assets/rox-widget-v1.js');
const base=path.resolve(__dirname,'..');
const JS=fs.readFileSync(path.join(base,'site/assets/rox-widget-v1.js'),'utf8');
const CSS=fs.readFileSync(path.join(base,'site/assets/rox-widget-v1.css'),'utf8');
const tests=[
 ['commercial: atacado',()=>assert.equal(api.classify('Quero revender no atacado').intent,'commercial')],
 ['commercial: varejo',()=>assert.equal(api.classify('Quero comprar no varejo').intent,'commercial')],
 ['general: comprar iphone',()=>assert.equal(api.classify('Quero comprar um iPhone').intent,'general')],
 ['commercial: pedido',()=>assert.equal(api.classify('Onde está meu pedido?').intent,'commercial')],
 ['commercial: preco da marca',()=>assert.equal(api.classify('Quanto custa na LANDER RIO?').intent,'commercial')],
 ['commercial: preco follow-up',()=>assert.equal(api.classify('Qual o preço?',{lastIntent:'commercial'}).intent,'commercial')],
 ['general: preco iphone',()=>assert.equal(api.classify('Qual o preço de um iPhone 16?').intent,'general')],
 ['general: valor de passagem',()=>assert.equal(api.classify('Quanto custa passagem?').intent,'general')],
 ['clinical: testosterona',()=>assert.equal(api.classify('Tem testosterona para vender?').intent,'clinical')],
 ['clinical: tirzepatida',()=>assert.equal(api.classify('Quanto custa tirzepatida?').intent,'clinical')],
 ['clinical no sales handoff',()=>assert.equal(api.respond('Retatrutida no atacado').intent,'clinical')],
 ['handoff varejo',()=>assert.match(decodeURIComponent(api.handoffHref('varejo','Atendimento no varejo','5521920043538')),/no varejo/)],
 ['privacy: phone',()=>assert.equal(api.classify('Meu telefone é 21912345678').intent,'privacy')],
 ['privacy: email',()=>assert.equal(api.classify('Aqui meu e-mail a@empresa.com').intent,'privacy')],
 ['welcome',()=>assert.match(api.respond('oi').reply,/ROX/)],
 ['company',()=>assert.match(api.respond('O que é Lander Rio?').reply,/PERFORMANCE CULTURE/)],
 ['training',()=>assert.equal(api.respond('Quero uma ficha de treino').link,'/treino/')],
 ['nutrition',()=>assert.equal(api.respond('Como funciona dieta?').link,'/dieta/')],
 ['recover',()=>assert.match(api.respond('como melhorar o sono').reply,/descanso/i)],
 ['general outside domain',()=>assert.match(api.respond('Qual o preço do iPhone?').reply,/tempo real/)],
 ['business has no invented price',()=>assert.doesNotMatch(api.respond('Quero consultar estoque').reply,/R\$\s*\d|disponivel agora|entrega garantida/i)],
 ['business CTA a wa.me',()=>assert.match(api.handoffHref('atacado','Atendimento para revendedores','5521920043538'),/^https:\/\/wa\.me\/5521920043538\?text=/)],
 ['business CTA does not expose conversation',()=>assert.doesNotMatch(decodeURIComponent(api.handoffHref('atacado','Atendimento para revendedores','5521920043538')),/CPF|transcri[cç][aã]o|hist[oó]rico/i)],
 ['missing phone means no CTA',()=>assert.equal(api.handoffHref('geral','Consulta comercial',''), '')],
 ['invalid phone means no CTA',()=>assert.equal(api.handoffHref('geral','Consulta comercial','55<script>'), '')],
 ['no paid calls',()=>assert.doesNotMatch(JS,/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/)],
 ['default disabled preview gate',()=>assert.match(JS,/get\('rox-preview'\) !== '1'.*dataset\.roxPreview !== '1'/)],
 ['no browser persistence',()=>assert.doesNotMatch(JS,/\b(localStorage|sessionStorage|indexedDB)\b/)],
 ['chat text uses textContent',()=>assert.match(JS,/wrap\.textContent\s*=/)],
 ['mobile CSS included',()=>assert.match(CSS,/@media\(max-width:640px\)/)],
 ['reduced motion',()=>assert.match(CSS,/prefers-reduced-motion/)],
 ['no admin controls',()=>assert.doesNotMatch(JS,/painel administrativo|gerenciar leads|editar politicas|token de acesso/i)],
 ['no hidden API secrets',()=>assert.doesNotMatch(JS,/sk-proj-|service_role|secret_key/i)],
];
for(const [name,fn] of tests)test(name,fn);