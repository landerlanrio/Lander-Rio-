/** Deterministic audit heuristic. Not search volume, revenue or projected clicks. */
export const NORMAL_DOMAIN = 'landerrio.com.br';
/** Reject incomplete or corrupt remote updates before replacing the last good snapshot. */
export function validateDashboardSnapshot(next, previous = null, now = Date.now()) {
  const invalid = () => { throw Error('Snapshot inválido ou incompleto'); };
  if (next?.schemaVersion !== 2 || next.propriedade !== 'sc-domain:landerrio.com.br' || next.paginacao_completa !== true || next.dataState !== 'final' || !Array.isArray(next.paginas) || next.paginas.length > 50000) invalid();
  const timestamp = Date.parse(next.captura);
  if (typeof next.captura !== 'string' || !Number.isFinite(timestamp) || timestamp > now + 300000) invalid();
  if (previous && Number.isFinite(Date.parse(previous.captura)) && timestamp < Date.parse(previous.captura)) throw Error('Snapshot anterior ao carregado');
  const isDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
  if (!isDate(next.periodo_inicio) || !isDate(next.periodo_fim) || next.periodo_inicio > next.periodo_fim || Date.parse(next.periodo_fim) > timestamp) invalid();
  const seen = new Set();
  for (const p of next.paginas) {
    if (!p || typeof p.url !== 'string') invalid();
    const u = new URL(p.url);normalizeUrl(p.url);
    if(u.search || u.hash || seen.has(p.url)) invalid();seen.add(p.url);
    for(const key of ['cliques','impressoes','ctr','posicao']) if(typeof p[key] !== 'number' || !Number.isFinite(p[key]) || p[key] < 0) invalid();
    if(!Number.isInteger(p.cliques) || !Number.isInteger(p.impressoes) || p.cliques > p.impressoes || p.ctr > 1 || p.posicao < 1 || Math.abs(p.ctr - (p.impressoes ? p.cliques/p.impressoes : 0)) > .001) invalid();
  }
  return next;
}
const restrictedTerms = /(testosteron|trembolon|anabol|horm[oô]ni|retatrut|tirzepat|clembuterol|durateston|hcg|medicamen|prescri|dose|substancia)/i;
export function normalizeUrl(url) {
  const u = new URL(url);
  if (u.username || u.password || u.port || !['https:', 'http:'].includes(u.protocol) || !['landerrio.com.br', 'www.landerrio.com.br'].includes(u.hostname)) throw Error('URL fora do domínio autorizado');
  return 'https://' + NORMAL_DOMAIN + (u.pathname.replace(/\/{2,}/g,'/').replace(/\/?$/, '/') || '/');
}
export function isRegulatedContext(url) {
  let path = new URL(normalizeUrl(url)).pathname;
  return path.startsWith('/marcas/') && path !== '/marcas/' || path.startsWith('/enciclopedia/substancias/') || restrictedTerms.test(path);
}
export function readableName(url) {
  let path = new URL(normalizeUrl(url)).pathname.split('/').filter(Boolean);
  if (!path.length) return 'Página inicial';
  let slug = path.at(-1);
  const alias = { 'life-peptideos':'Life Peptídeos','muscle-labs-india':'Muscle Labs India','cooper-pharma':'Cooper Pharma','landerlan-gold':'Landerlan Gold','geniqs-pharma':'Geniqs Pharma','oxygen-kw-pharma':'Oxygen KW Pharma','zphc':'ZPHC','landerlan':'Landerlan','alpha-laboratory':'Alpha Laboratory','synedica':'Synedica','marcas':'Diretório de marcas','conteudos':'Editorial','atacado':'Atacado','varejo':'Varejo','autenticidade':'Autenticidade','contato':'Contato','perguntas-frequentes':'Perguntas frequentes','treino':'Treino','dieta':'Dieta'};
  return alias[slug] || slug.split('-').map(w=>w.slice(0,1).toUpperCase()+w.slice(1)).join(' ');
}
export function scorePage(p, maxImpressions=201) {
  const impressions=Math.max(0, Number(p.impressoes)||0), clicks=Math.max(0, Number(p.cliques)||0), pos=Number(p.posicao)||100;
  const ctr= impressions>0 ? clicks/impressions : 0;
  const demand= Math.log1p(impressions)/Math.log1p(Math.max(1, maxImpressions));
  const reach=pos>=4&&pos<=20 ? (21-pos)/17 : pos<4 ? .45 : .05;
  const review=ctr<.04? 1 : ctr<.10? .5: .15;
  let score=Math.round(100*(.50*demand+.30*reach+.20*review));
  if (impressions < 20) score=Math.round(score*.55);
  return Math.max(0,Math.min(100,score));
}
export function statusFor(p){
  if(p.impressoes<20) return 'Dados insuficientes';
  if(p.posicao>20) return 'Investigar relevância';
  if(p.posicao>=3&&p.posicao<=20) return 'Revisar página';
  return 'Acompanhar';
}
export function rankPages(pages){
  const safePages = pages.filter(x=>{try{normalizeUrl(x.url);return true}catch{return false}});
  const maxImpressions=Math.max(1,...safePages.map(x=>Number(x.impressoes)||0));
  return safePages.map(p=>({...p,url:normalizeUrl(p.url),nome:readableName(p.url),pontuacao:scorePage(p,maxImpressions),situacao:statusFor(p),revisao_regulatoria:isRegulatedContext(p.url)})).sort((a,b)=>b.pontuacao-a.pontuacao||b.impressoes-a.impressoes);
}
export function makeBrief(page, querySamples=[]){
  const restricted=isRegulatedContext(page.url);
  const safeQueries=querySamples.filter(q=>!restrictedTerms.test(q.consulta||'')).slice(0,6);
  return {
    url:normalizeUrl(page.url),
    pagina:readableName(page.url),
    dados_verificados:{impressoes:page.impressoes,cliques:page.cliques,ctr:page.ctr,posicao:page.posicao,consultas:safeQueries},
    hipotese:'A consulta e a página podem apresentar lacuna de relevância, snippet ou clareza. Verificar manualmente antes de alterar.',
    objetivo:restricted?'Fortalecer informação institucional verificável, sem promoção, prescrição ou alegações sobre uso terapêutico.':'Explicar o assunto com utilidade prática e encaminhamentos editoriais claros.',
    perguntas_a_apurar:restricted?["Qual é a identificação correta e documentada da marca?","Quais fontes primárias sustentam informações institucionais?","Quais avisos de vínculo, procedência e conteúdo de saúde são necessários?"]:["O que o usuário realmente busca nesta página?","Quais fontes verificáveis sustentam respostas úteis?","Qual o melhor próximo conteúdo para aprofundamento?"],
    tarefas:["Verificar H1, meta title, description e canonical no HTML publicado","Comparar conteúdo atual com a intenção de busca das consultas reais","Corrigir informações imprecisas e introduzir fontes verificáveis","Revisar navegação e links internos pertinentes","Testar mobile, acessibilidade e indexação antes de publicar"],
    gates:restricted?["Revisão regulatória e editorial obrigatória","Sem CTA de compra ou aconselhamento médico","Sem afirmações de autenticidade não comprovadas"]:["Revisão editorial","Nenhuma promessa de posicionamento ou conversão"],
    publico:false
  };
}
export function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function parseCSV(input){
  const firstLine=input.replace(/^\uFEFF/,'').split(/\r?\n/).find(s=>s.trim())||'';
  const delim=(firstLine.match(/;/g)||[]).length > (firstLine.match(/,/g)||[]).length ? ';' : ',';
  let rows=[],cell='',line=[],quoted=false;
  for(let i=0;i<input.length;i++){
    const c=input[i];
    if(c==='"') {if(quoted&&input[i+1]==='"'){cell+='"';i++}else quoted=!quoted;continue}
    if(!quoted&&c===delim){line.push(cell.trim());cell='';continue}
    if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&input[i+1]==='\n')i++;line.push(cell.trim());cell='';if(line.some(x=>x))rows.push(line);line=[];continue}
    cell+=c;
  }
  if(quoted)throw Error('CSV com aspas não fechadas');
  line.push(cell.trim());if(line.some(x=>x))rows.push(line);
  const hdr=rows.shift()?.map(x=>x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim())||[];
  function index(...names){return hdr.findIndex(h=>names.some(n=>h===n))}
  const iURL=index('pagina','page','top pages','url','pages'), iClicks=index('cliques','clicks'), iImp=index('impressoes','impressions'), iCTR=index('ctr'), iPos=index('posicao','position');
  if(iURL<0||iClicks<0||iImp<0||iPos<0)throw Error('CSV precisa conter Página, Cliques, Impressões e Posição.');
  const toNumber=(n)=>{n=String(n||'').trim().replace(/%/g,'');if(n.includes(',') && n.includes('.'))n=n.replace(/\./g,'').replace(',','.');else if(n.includes(','))n=n.replace(',','.');const value=Number(n);if(!Number.isFinite(value)||value<0)throw Error('CSV contém métrica inválida');return value};
  return rows.map(row=>{
    const url=normalizeUrl(row[iURL]);
    const cliques=toNumber(row[iClicks]),impressoes=toNumber(row[iImp]);
    const rawCTR = iCTR>=0?String(row[iCTR]):'';
    const ctr=rawCTR?toNumber(rawCTR)/(rawCTR.includes('%')?100:(toNumber(rawCTR)>1?100:1)):(impressoes?cliques/impressoes:0);
    const posicao=toNumber(row[iPos]);if(cliques>impressoes||!Number.isInteger(cliques)||!Number.isInteger(impressoes)||ctr>1||posicao<1)throw Error('CSV contém métrica fora do limite');
    return {url,cliques,impressoes,ctr:impressoes?cliques/impressoes:0,posicao};
  });
}
