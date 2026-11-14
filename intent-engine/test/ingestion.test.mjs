import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {closedWindow,toSnapshot}from '../lib/ingestion.mjs';
const input=JSON.parse(fs.readFileSync(new URL('fixtures/openseo-success.json',import.meta.url))),now=new Date(input.capturedAt);
const copy=()=>structuredClone(input);
test('janela fechada usa calendário Pacific, atravessa mês/ano',()=>{assert.deepEqual(closedWindow(new Date('2026-01-03T02:00:00Z')),{startDate:'2025-12-03',endDate:'2025-12-30'});});
test('snapshot real é determinístico e não mistura consultas com páginas',()=>{const a=toSnapshot(input,now),b=toSnapshot(input,now);assert.deepEqual(a,b);assert.equal(a.paginas.length,24);assert.equal(a.paginas.reduce((n,r)=>n+r.cliques,0),61);assert.deepEqual(a.consultas_verificadas,{});});
for(const [label,mutate]of [
 ['propriedade',x=>x.batches[0].siteUrl='sc-domain:outro.com'],
 ['autenticação',x=>x.batches[0].connectionRequired=true],
 ['coleta truncada',x=>x.batches[0].hasMore=true],
 ['query no lugar de page',x=>x.request.dimensions=['query']],
 ['número negativo',x=>x.batches[0].rows[0].clicks=-1],
 ['CTR inválido',x=>x.batches[0].rows[0].ctr=1],
 ['URL externa',x=>x.batches[0].rows[0].keys=['https://evil.test/']],
 ['URL com credencial',x=>x.batches[0].rows[0].keys=['https://user:password@landerrio.com.br/']],
 ['URL com dados pessoais',x=>x.batches[0].rows[0].keys=['https://landerrio.com.br/?email=private']],
 ['data futura',x=>x.request.endDate='2099-01-01'],
 ['captura futura',x=>x.capturedAt='2099-01-01T00:00:00Z'],
 ['data inexistente',x=>x.request.startDate='2026-02-30'],
])test('rejeita '+label,()=>{const x=copy();mutate(x);assert.throws(()=>toSnapshot(x,now));});
test('paginação completa e rejeição de duplicatas',()=>{const x=copy(),r=x.batches[0].rows;x.batches=[{...x.batches[0],rows:r.slice(0,10),rowCount:10,hasMore:true,nextStartRow:10},{...x.batches[0],startRow:10,rows:r.slice(10),rowCount:r.length-10,hasMore:false}];assert.equal(toSnapshot(x,now).paginas.length,24);x.batches[1].rows[0]=x.batches[0].rows[0];assert.throws(()=>toSnapshot(x,now));});
test('GA4 indisponível permanece null em vez de zero',()=>{const x=copy();x.ga4={};assert.equal(toSnapshot(x,now).analytics.sessoes_organicas,null);});
test('variantes canônicas agregam CTR e posição ponderada',()=>{const x=copy(),b=x.batches[0];b.rows.push({...b.rows[0],keys:['https://www.landerrio.com.br/']});b.rowCount++;const p=toSnapshot(x,now).paginas.find(x=>x.url==='https://landerrio.com.br/');assert.equal(p.cliques,44);assert.equal(p.posicao,8.5);});
