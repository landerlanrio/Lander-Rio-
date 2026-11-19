import { createHash } from 'node:crypto';
import { normalizeUrl } from './intent-engine.mjs';
export const PROJECT = 'cc40f4de-9c11-47c9-be5b-dcb4387db222';
export const PROPERTY = 'sc-domain:landerrio.com.br';
const fail = message => { throw Error(message); };
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
export function closedWindow(now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year:'numeric',month:'2-digit',day:'2-digit' }).format(now);
  const end = new Date(today + 'T12:00:00Z'); end.setUTCDate(end.getUTCDate()-3);
  const start = new Date(end); start.setUTCDate(start.getUTCDate()-27);
  return { startDate: start.toISOString().slice(0,10), endDate: end.toISOString().slice(0,10) };
}
export function validateEnvelope(input, now = new Date()) {
  if (input?.schemaVersion !== 1 || input.provider !== 'openseo' || input.projectId !== PROJECT) fail('Origem/projeto inesperado');
  if (!Number.isFinite(Date.parse(input.capturedAt)) || Date.parse(input.capturedAt)>now.getTime()+300000) fail('Captura inválida');
  const r=input.request;
  if (!date(r?.startDate) || !date(r.endDate) || r.startDate>r.endDate || r.endDate>closedWindow(now).endDate || (Date.parse(r.endDate)-Date.parse(r.startDate))/86400000>30) fail('Janela inválida ou ainda aberta');
  if (r.dataState!=='final' || r.type!=='web' || JSON.stringify(r.dimensions)!=='["page"]' || r.rowLimit!==1000) fail('Contrato GSC inválido');
  if (!Array.isArray(input.batches) || !input.batches.length || input.batches.length>50) fail('Paginação inválida');
  let offset=0;const rows=[],seen=new Set();
  input.batches.forEach((b,i)=>{
    if (b.ok!==true || b.connectionRequired || b.siteUrl!==PROPERTY || b.startDate!==r.startDate || b.endDate!==r.endDate || JSON.stringify(b.dimensions)!=='["page"]') fail('Resposta GSC inválida');
    if (b.startRow!==offset || !Array.isArray(b.rows) || b.rowCount!==b.rows.length || b.rows.length>1000) fail('Página fora de sequência');
    const more=i<input.batches.length-1;
    if (b.hasMore!==more || more && (b.nextStartRow!==offset+b.rows.length || !b.rows.length)) fail('Coleta incompleta');
    for(const row of b.rows){
      if(row.keys?.length!==1) fail('Dimensão incorreta');
      const url=row.keys[0]; const parsed=new URL(url);
      if(parsed.username||parsed.password||parsed.port||parsed.search||parsed.hash) fail('URL deve ser canônica e sem parâmetros');
      normalizeUrl(url);
      if(seen.has(url)) fail('Linha repetida entre páginas'); seen.add(url);
      for(const key of ['clicks','impressions','ctr','position']) if(typeof row[key]!=='number'||!Number.isFinite(row[key])||row[key]<0) fail('Métrica inválida');
      if(!Number.isInteger(row.clicks)||!Number.isInteger(row.impressions)||row.clicks>row.impressions||row.ctr>1||row.position<1) fail('Métrica fora do limite');
      if(Math.abs(row.ctr-(row.impressions?row.clicks/row.impressions:0))>0.001) fail('CTR inconsistente');
      rows.push(row);
    }
    offset+=b.rows.length;
  });
  return rows;
}
export function toSnapshot(input, now = new Date()) {
  const rows=validateEnvelope(input,now), grouped=new Map();
  for(const r of rows){const url=normalizeUrl(r.keys[0]);const p=grouped.get(url)||{url,cliques:0,impressoes:0,weighted:0};p.cliques+=r.clicks;p.impressoes+=r.impressions;p.weighted+=r.position*r.impressions;grouped.set(url,p);}
  const pages=[...grouped.values()].map(p=>({url:p.url,cliques:p.cliques,impressoes:p.impressoes,ctr:p.impressoes?p.cliques/p.impressoes:0,posicao:p.impressoes?p.weighted/p.impressoes:0}));
  const g=input.ga4?.overview, matching=g?.status==='ok'&&g.source?.propertyId==='properties/548953010'&&g.request?.resolvedDateRange?.startDate===input.request.startDate&&g.request?.resolvedDateRange?.endDate===input.request.endDate;
  const dataHash=createHash('sha256').update(JSON.stringify({request:input.request,rows,ga4:input.ga4||null})).digest('hex');
  return {schemaVersion:2,fonte:'Google Search Console via OpenSEO autenticado',propriedade:PROPERTY,periodo_inicio:input.request.startDate,periodo_fim:input.request.endDate,captura:input.capturedAt,dimensao:'page',dataState:'final',dataHash,paginacao_completa:true,nota:'Linhas retornadas pela API; consultas anonimizadas e limites do Google impedem inferir cobertura total. Não somar dimensões.',paginas:pages,consultas_verificadas:{},analytics:matching?{fonte:'GA4 via OpenSEO',periodo_inicio:input.request.startDate,periodo_fim:input.request.endDate,sessoes_organicas:g.current?.sessions??null,eventos_chave:g.current?.keyEvents??null,fuso:g.request.propertyTimeZone,ultima_data_com_atividade_no_retorno:(g.trend||[]).filter(x=>x.sessions>0).map(x=>x.date).sort().at(-1)||null,observacao:'Eventos-chave não comprovam conversas ou vendas. Instrumentação nova ainda não validada na propriedade.'}:{fonte:'GA4 indisponível para esta janela',sessoes_organicas:null,eventos_chave:null},homologacao:{local:'ver evidence/validation.json',ga4_recebimento:'pendente',producao:'não publicada'}};
}
