/* LANDER RIO — ROX offline FAQ demonstrator. No API, storage, persistence or auto messages.
   Not the ROX 2.0 backend. Only links to an explicit WhatsApp chat after visitor consent. */
(()=>{'use strict';
const root=document.querySelector('[data-rox-root]');if(!root)return;
const launcher=root.querySelector('[data-rox-launcher]'),panel=root.querySelector('[data-rox-dialog]'),closer=root.querySelector('[data-rox-close]'),log=root.querySelector('[data-rox-log]'),form=root.querySelector('[data-rox-form]'),input=root.querySelector('[data-rox-input]'),quick=root.querySelector('[data-rox-quick]'),handoff=root.querySelector('[data-rox-handoff]');
const WA='5521920043538',MAX=24;let turns=0,returnTo=launcher,history=[];
const agent=window.LanderRoxAgentV3&&typeof window.LanderRoxAgentV3.agentTurnV3==='function'?window.LanderRoxAgentV3.agentTurnV3:null;
const clean=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function classify(value){const x=clean(value);
if(/\b(ozempic|mounjaro|wegovy|semaglutid[ae]|tirzena|tirzec|lipoless|retagen|hcg|ghk.?cu|nandrolona|oxandrolona|peptideos?)\b/.test(x))return 'medical';
if(/(\b\d+\s*(mg|ml|ui)\b|dose|dosagem|posologia|anabol|esteroid|hormon|insulin|tirzepat|retatrut|testosterona|medicamento)/.test(x))return 'medical';
if(/(atendente|humano|equipe|whatsapp|suporte|contato|falar com)/.test(x))return 'human';
if(/(revend|atacado|distribui|lojista|volume de compra)/.test(x))return 'wholesale';
if(/(varejo|pessoa fisica|para mim|cliente final)/.test(x))return 'retail';
if(/(parcer|influenc|colaborac|divulg)/.test(x))return 'partners';
if(/(preco|valor|estoque|orcamento|disponibil|pedido|frete|envio|pagamento|entrega)/.test(x))return 'commerce';
if(/(ficha|treino|exercicio|musculac|academia|hipertrofia|forca)/.test(x))return 'training';
if(/(dieta|comer|aliment|nutri|proteina|caloria|macro)/.test(x))return 'diet';
if(/(ciencia|conteudo|enciclopedia|pesquisa|estudo|fisiologia)/.test(x))return 'science';
if(/(privacidade|lgpd|meus dados|consentimento)/.test(x))return 'privacy';
if(/(quem e voce|o que e rox|sua ia|robo|assistente|rox)/.test(x))return 'aboutrox';
if(/(lander rio|quem somos|sobre a marca|a empresa)/.test(x))return 'brand';
if(/^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|hey)[!?. ]*$/.test(x))return 'hello';
if(/(obrigad|valeu|perfeito|show)/.test(x))return 'thanks';
return 'unknown';}
const answers={
medical:'Temos conteúdos educativos sobre ciência e saúde, mas não indicamos doses, uso, aquisição ou tratamento de medicamentos. Para questões clínicas, procure um profissional habilitado.',
human:'Posso abrir o WhatsApp oficial. A equipe precisa confirmar informações comerciais; nenhuma mensagem é enviada automaticamente por mim.',
wholesale:'A LANDER RIO tem atendimento específico para revendedores. Confira /atacado/; quantidade, disponibilidade e condições são confirmadas diretamente com a equipe.',
retail:'Para consultas individuais, há um caminho próprio em /varejo/. A equipe confirma quais solicitações pode atender e as condições aplicáveis.',
partners:'Para propor uma parceria, apresente sua atuação e proposta pelo canal de contato da LANDER RIO. Não posso prometer aprovação ou condições.',
commerce:'Preço, estoque, condições, pagamento, prazo e envio exigem confirmação humana. Posso preparar um encaminhamento para o WhatsApp oficial, sem enviar por você.',
training:'Você pode começar pela ferramenta gratuita de treino em /treino/. Ela organiza uma ficha educativa conforme dados informados, sem substituir orientação profissional.',
diet:'A ferramenta de dieta está em /dieta/: estimativas de energia, refeições e organização alimentar. É educativa e não constitui prescrição individual.',
science:'Nossos guias ficam em /conteudos/ e a enciclopédia informativa em /enciclopedia/. Eles não substituem avaliação profissional.',
privacy:'Este ROX de demonstração não transmite nem armazena o texto digitado. Confira os termos em /privacidade para conhecer as práticas gerais do site.',
aboutrox:'Sou a demonstração offline do ROX, guia digital da LANDER RIO. Respondo dúvidas básicas e indico caminhos. O agente de IA conectado ainda não está ativo nesta versão.',
brand:'LANDER RIO — PERFORMANCE CULTURE reúne conteúdo sobre musculação e ciência da performance, ferramentas gratuitas e atendimento por caminhos separados.',
hello:'Olá! Sou o ROX. Quer saber sobre treino, dieta, ciência, varejo, revenda ou atendimento?',
thanks:'À disposição. Quer explorar alguma ferramenta ou falar com nossa equipe?',
unknown:'Não tenho uma resposta verificada para isso nesta demonstração. Posso ajudar com treino, dieta, conteúdos, varejo, revenda e atendimento humano.'};
function append(text,who){const el=document.createElement('div');el.className='v25-rox-msg';el.dataset.who=who;el.textContent=text;log.appendChild(el);log.scrollTop=log.scrollHeight;}
function setHandoff(kind){const category={human:'atendimento humano',wholesale:'atacado e revenda',retail:'atendimento individual',partners:'parcerias',commerce:'informações comerciais'}[kind];if(!category)return;handoff.hidden=false;handoff.href='https://wa.me/'+WA+'?text='+encodeURIComponent('Olá! Vim pelo ROX no site da LANDER RIO e gostaria de orientação sobre '+category+'.');handoff.dataset.profile=kind==='wholesale'?'atacado':kind==='retail'?'varejo':'geral';}
async function ask(raw){
 if(turns>=MAX)return;
 const value=String(raw||'').trim().slice(0,240);
 if(!value)return;
 append(value,'user');
 const kind=classify(value);
 let decision=null;
 if(agent){try{decision=agent({message:value,history:history.slice(-4)});}catch(_err){decision=null;}}
 const transport=window.LanderRoxTransport;
 if(decision?.mode==='unknown'&&transport?.enabled===true&&typeof transport.ask==='function'){
   const submit=form.querySelector('button[type="submit"]');input.disabled=true;submit.disabled=true;
   try{const remote=await transport.ask(value,history.slice(-4));if(remote&&typeof remote.reply==='string')decision=remote;}
   catch(_err){}finally{input.disabled=false;submit.disabled=false;}
 }
 const reply=decision?.mode==='clinical'?answers.medical:
   (decision?.mode==='unknown' && ['hello','thanks','science','privacy'].includes(kind))?answers[kind]:
   (typeof decision?.reply==='string'&&decision.reply?decision.reply:answers[kind]);
 append(reply,'rox');
 handoff.hidden=true;handoff.href='';handoff.dataset.profile='geral';
 if(decision?.mode==='handoff'){
   const wa=decision.integrations?.whatsapp;
   if(wa?.method==='manual_draft'&&wa.sent===false&&wa.conversation_confirmed===false&&typeof wa.message==='string'&&wa.message.length<400){
     handoff.href='https://wa.me/'+WA+'?text='+encodeURIComponent(wa.message);
     handoff.hidden=false;
     handoff.dataset.profile=decision.qualification?.segment==='atacado'?'atacado':decision.qualification?.segment==='varejo'?'varejo':'geral';
   }
 }else if(!decision && kind!=='medical'&&kind!=='privacy')setHandoff(kind);
 else if(decision?.mode==='unknown'&&kind==='human')setHandoff('human');
 // Only allowlisted segment intent is kept in ephemeral memory, never raw transcript.
 if(decision?.mode==='handoff'){
   const q=decision.qualification;
   const topic=['pedido','parceria','catalogo','condicoes','estoque','humano'].includes(q?.topic_id)?q.topic_id:'';
   const segment=['atacado','varejo'].includes(q?.segment)?q.segment:'';
   const amount=Number.isInteger(q?.quantity)&&q.quantity>0&&q.quantity<=999?q.quantity+' unidades':'';
   history=[{role:'user',content:[segment,topic,amount].filter(Boolean).join(' ')}];
 }else if(decision?.mode==='privacy'||decision?.mode==='clinical')history=[];
 window.LanderMeasurement?.push('rox_response',{placement:'rox',mode:decision?.mode||'offline'});
 turns++;
 if(turns>=MAX){
   input.disabled=true;form.querySelector('button[type="submit"]').disabled=true;
   quick.querySelectorAll('button').forEach(b=>{b.disabled=true});
   append('Limite de demonstração atingido. Recarregue a página ou fale com a equipe pelo canal oficial.','rox');
 }
}
function setOpen(open){if(open){returnTo=document.activeElement||launcher;}panel.hidden=!open;launcher.setAttribute('aria-expanded',String(open));root.dataset.open=String(open);if(open){input.focus({preventScroll:true});window.LanderMeasurement?.push('rox_opened',{placement:'rox'});}else if(returnTo&&typeof returnTo.focus==='function')returnTo.focus({preventScroll:true});}
launcher.addEventListener('click',()=>setOpen(panel.hidden));closer.addEventListener('click',()=>setOpen(false));root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();setOpen(false)}});
form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);input.value='';if(!input.disabled)input.focus()});quick.addEventListener('click',e=>{const b=e.target.closest('button[data-question]');if(!b||b.disabled)return;ask(b.dataset.question)});
const hero=document.querySelector('.v26-hero')||document.querySelector('.v25-hero');if(hero&&'IntersectionObserver'in window){new IntersectionObserver(([e])=>{root.dataset.pastHero=String(!e.isIntersecting&&e.boundingClientRect.bottom<0)}, {threshold:0}).observe(hero);}else root.dataset.pastHero='true';
window.LanderRoxDemo={isDemo:true,classify,agentConnected:Boolean(agent)};
})();
