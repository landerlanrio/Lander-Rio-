import fs from 'node:fs';
const base=new URL('../',import.meta.url);
const read=x=>fs.readFileSync(new URL(x,base),'utf8');
let template=read('dashboard.template.html');
const moduleCode=read('lib/intent-engine.mjs').replace(/^export /gm,'');
const snapshot=JSON.stringify(JSON.parse(read('data/observacoes.json'))).replace(/</g,'\\u003c');
template=template.replace('__SNAPSHOT__',snapshot).replace('/* ENGINE_MODULE */',moduleCode);
fs.writeFileSync(new URL('index.html',base),template);
console.log('Dashboard offline criado:',new URL('index.html',base).pathname);
