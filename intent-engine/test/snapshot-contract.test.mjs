import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateDashboardSnapshot} from '../lib/intent-engine.mjs';
const original=JSON.parse(fs.readFileSync(new URL('../data/observacoes.json',import.meta.url)));
test('accepts the actual complete authenticated snapshot',()=>assert.equal(validateDashboardSnapshot(original),original));
for(const [name,mutate] of Object.entries({
 'invalid capture date':s=>s.captura='not-a-date',
 'future capture':s=>s.captura='2099-01-01T00:00:00Z',
 'incomplete pages':s=>s.paginacao_completa=false,
 'impossible period':s=>s.periodo_fim='2026-02-31',
 'clicks exceeding impressions':s=>s.paginas[0].cliques=s.paginas[0].impressoes+1,
 'negative metric':s=>s.paginas[0].posicao=-1,
 'non-numeric metric':s=>s.paginas[0].impressoes='123',
 'foreign URL':s=>s.paginas[0].url='https://example.org/',
 'URL query data':s=>s.paginas[0].url+='?email=private',
 'duplicate row':s=>s.paginas.push({...s.paginas[0]}),
 'inconsistent CTR':s=>s.paginas[0].ctr=.999
}))test('rejects '+name+' and leaves previous data intact',()=>{const next=structuredClone(original),before=JSON.stringify(original);mutate(next);assert.throws(()=>validateDashboardSnapshot(next,original));assert.equal(JSON.stringify(original),before)});
test('rejects older valid snapshot',()=>{const older=structuredClone(original);older.captura=new Date(Date.parse(original.captura)-86400000).toISOString();assert.throws(()=>validateDashboardSnapshot(older,original),/anterior/)});
