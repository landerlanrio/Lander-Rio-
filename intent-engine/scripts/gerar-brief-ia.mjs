/** Optional, privately executed paid API call. Never called by the public-facing dashboard. */
import fs from 'node:fs';
import {normalizeUrl,makeBrief} from '../lib/intent-engine.mjs';
const target=process.argv.find(x=>x.startsWith('--url='))?.slice(6);
if (!target) { console.error('Uso: node scripts/gerar-brief-ia.mjs --url=https://landerrio.com.br/marcas/.../ [--confirmar-chamada-paga]'); process.exit(2); }
let url;try {url=normalizeUrl(target)}catch {console.error('URL fora do dominio LANDER RIO.');process.exit(2)}
const source=JSON.parse(fs.readFileSync(new URL('../data/observacoes.json',import.meta.url)));
const page=source.paginas.find(p=>normalizeUrl(p.url)===url);
if(!page){console.error('URL ausente da amostra real. Importe-a antes de gerar um briefing.');process.exit(2)}
const brief=makeBrief(page,source.consultas_verificadas[url]||[]);
if(!process.argv.includes('--confirmar-chamada-paga')){
  console.log('MODO SEM CUSTO: nenhuma chamada de IA executada.');
  console.log(JSON.stringify(brief,null,2));
  console.log('Para usar a OpenAI API, configure OPENAI_API_KEY e OPENAI_MODEL localmente e execute com --confirmar-chamada-paga.');
  process.exit(0);
}
const key=process.env.OPENAI_API_KEY, model=process.env.OPENAI_MODEL;
if(!key||!model){console.error('OPENAI_API_KEY e OPENAI_MODEL obrigatorios para chamada paga.');process.exit(2)}
const prompt=`Crie um briefing editorial em português brasileiro para auditoria da página existente da LANDER RIO. Use APENAS os dados do JSON. Separe fatos observados, hipóteses e verificações pendentes. Não invente volume de busca, autoridade da marca, produto, autenticidade, oferta, estoque, vínculo ou resultados esperados. Não recomende compra ou promoção de medicamentos controlados, substâncias hormonais ou peptídeos; não dê doses, protocolos ou orientação clínica. Nunca gere conteúdo final para publicação automática. Escreva: (1) diagnóstico editorial; (2) perguntas sobre intenção de busca observada; (3) 3 sugestões de meta title, considerando limites e sem afirmações não comprovadas; (4) estrutura de conteúdo editorial seguro; (5) lista de fontes primárias a verificar; (6) critérios de QA; (7) pendências de revisão humana.\n\nDADOS VERIFICADOS: ${JSON.stringify(brief)}`;
const response=await fetch('https://api.openai.com/v1/responses',{
  method:'POST',
  headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
  body:JSON.stringify({model,store:false,max_output_tokens:1100,input:[{role:'developer',content:'Você é um auditor editorial técnico, conservador com evidências e conformidade.'},{role:'user',content:prompt}]})
});
const result=await response.json();
if(!response.ok){console.error('Falha OpenAI API: HTTP '+response.status+' '+String(result?.error?.message||'sem detalhes'));process.exit(1)}
const output=(result.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
if(!output.trim()){console.error('A resposta não trouxe texto aproveitável. Nenhum arquivo gerado.');process.exit(1)}
const filename=`brief_ia_${new URL(url).pathname.split('/').filter(Boolean).join('_')||'home'}.md`;
const out=new URL('../data/'+filename,import.meta.url);
fs.writeFileSync(out,'# Rascunho de IA — NÃO PUBLICAR SEM REVISÃO\n\n'+output+'\n');
console.log('Rascunho gerado para revisão: '+out.pathname);console.log('Tokens usados:',JSON.stringify(result.usage||{}));
