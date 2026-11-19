import { agentTurnV3 } from '../rox-ai-v2/agent-v3.mjs';
const el = id => document.getElementById(id);
const text = (parent, tag, value, cls) => { const node = document.createElement(tag); node.textContent = String(value); if(cls) node.className=cls; parent.appendChild(node); return node; };
const fmt = n => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(n);
const data = await fetch('./baseline.json', { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' }).then(r=>{ if(!r.ok) throw Error('Baseline indisponível'); return r.json(); });
for(const [label,value] of [['Sessões GA4',data.ga4.sessions],['Eventos generate_lead',data.ga4.generateLeadEvents],['Usuários desses eventos',data.ga4.generateLeadUsers],['Transações GA4',data.ga4.trackedTransactions]]) {
  const card=text(el('metrics'),'div','','card');text(card,'div',label,'label');text(card,'div',fmt(value),'value');text(card,'div','Contagem observada · não conversão comprovada','footnote');
}
for(const channel of data.channels){const row=text(el('channels'),'div','','row');text(row,'div',channel.name,'name');const track=text(row,'div','','track');const bar=text(track,'div','','fill');bar.style.width = Math.min(100,100*channel.sessions/Math.max(...data.channels.map(x=>x.sessions)))+'%';text(row,'span',channel.sessions,'count');}
for(const page of data.gscPages){const tr=text(el('seo-rows'),'tr','');text(tr,'td',page.url.replace('https://landerrio.com.br','')||'/','url');text(tr,'td',fmt(page.impressions),'num');text(tr,'td',fmt(page.clicks),'num');text(tr,'td',fmt(page.position),'num');}
const chat=el('chatlog'),form=el('rox-form'),input=el('rox-input');
function bubble(message,kind){const node=text(chat,'div',message,'msg '+kind);chat.scrollTop=chat.scrollHeight;return node;}
bubble('Sou o ROX em modo offline de testes. Posso falar sobre treino, dieta, ciência e atendimento, sem consultar APIs ou enviar mensagens.','rox');
form.addEventListener('submit',event=>{event.preventDefault();const message=input.value.trim();if(!message)return;const result=agentTurnV3({message});bubble(result.mode==='privacy'?'[Mensagem sensível omitida]':message,'user');bubble(result.reply,'rox');input.value='';input.focus();});
