import fs from 'node:fs';
const base=new URL('../',import.meta.url);
// No dataset, template or offline index is copied into public/.
const html=fs.readFileSync(new URL('index.html',base),'utf8');
fs.writeFileSync(new URL('lib/dashboard-bundle.mjs',base),'export default '+JSON.stringify(html)+';\n');
fs.mkdirSync(new URL('public/',base),{recursive:true});
fs.writeFileSync(new URL('public/index.html',base),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="robots" content="noindex"><title>LANDER INTENT ENGINE</title><p>Painel restrito. <a href="/intent/">Acessar com autenticação</a></p></html>');
console.log('Build privado concluído; métricas fora do diretório público.');
