/* Test harness only. Not shipped. Tests are invoked by visible browser controls. */
'use strict';
const frame=document.querySelector('#frame'),status=document.querySelector('#status');
const brands=['cooper-pharma','zphc','landerlan','oxygen-kw-pharma','alpha-x-prime','quimfa','eticos','indufar','life-peptideos','eminence-labs','topharma','muscle-labs-india','synedica','geniqs-pharma'];
const routes=['/equipe/','/politica-editorial/','/atacado/','/varejo/','/treino/','/dieta/','/','/marcas/','/marcas/landerlan-gold/','/conteudos/','/conteudos/peptideos-o-que-sao/','/conteudos/como-verificar-procedencia-canais-oficiais/','/conteudos/como-consultar-disponibilidade-marcas/','/conteudos/atacado-rio-como-avaliar-fornecedor/',...brands.map(s=>'/marcas/'+s+'/')];
routes.forEach(path=>{const o=document.createElement('option');o.value=path;o.textContent=path;document.querySelector('#route').append(o)});
document.querySelector('#route').value='/marcas/';
const settle=()=>new Promise(r=>setTimeout(r,100));
async function ready(){const d=frame.contentDocument;await d.fonts.ready;await Promise.allSettled([...d.images].map(i=>{i.loading='eager';return i.decode()}));await settle();}
async function visit(path){await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Timeout '+path)),12000);frame.addEventListener('load',()=>{clearTimeout(t);resolve()},{once:true});frame.src=path;});await ready();}
frame.addEventListener('load',()=>{const d=frame.contentDocument,w=frame.contentWindow;const m={lcp_ms:null,cls:0,scope:'Chromium local iframe; unthrottled; not field CWV'};d.documentElement.dataset.metrics=JSON.stringify(m);for(const type of ['largest-contentful-paint','layout-shift'])try{new w.PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='largest-contentful-paint')m.lcp_ms=e.startTime;else if(!e.hadRecentInput)m.cls+=e.value;}d.documentElement.dataset.metrics=JSON.stringify(m);}).observe({type,buffered:true});}catch{}});
document.querySelector('#width').onchange=e=>{frame.style.width=e.target.value+'px';};
document.querySelector('#route').onchange=e=>visit(e.target.value);
document.querySelector('#section').onchange=e=>{const d=frame.contentDocument;if(e.target.value==='top')frame.contentWindow.scrollTo(0,0);else d.getElementById(e.target.value)?.scrollIntoView({behavior:'instant'});};
document.querySelector('#capture').onclick=async()=>{await ready();status.textContent='Captura pronta';};
document.querySelector('#nojs').onchange=async e=>{if(e.target.checked)frame.setAttribute('sandbox','allow-same-origin');else frame.removeAttribute('sandbox');await visit(document.querySelector('#route').value);status.textContent='Sem JavaScript: '+e.target.checked;};
function snapshot(){const d=frame.contentDocument,w=frame.contentWindow;return {path:w.location.pathname,width:w.innerWidth,contentWidth:d.documentElement.scrollWidth,overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth,h1:d.querySelectorAll('h1').length,broken:[...d.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')),canvases:[...d.querySelectorAll('.lfx-brand-art,.ba-logo-canvas,.ba-showcase')].map(el=>w.getComputedStyle(el).backgroundColor),contain:[...d.querySelectorAll('.ba-logo-canvas img,.ba-showcase img')].every(i=>w.getComputedStyle(i).objectFit==='contain'),smallTargets:[...d.querySelectorAll('a,button,input,summary')].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.width<24||r.height<24}).map(e=>e.textContent.trim().slice(0,50)),metrics:JSON.parse(d.documentElement.dataset.metrics||'{}')};}
document.querySelector('#matrix').onclick=async()=>{const results=[];try{for(const path of routes){for(const width of [320,360,390,430,768,1280]){frame.style.width=width+'px';await visit(path);results.push(snapshot());status.textContent='Layouts '+results.length+'/168';document.querySelector('#result').textContent=JSON.stringify({results});}}const passed=results.every(r=>!r.overflow&&!r.broken.length&&r.h1===1&&r.contain&&r.canvases.every(c=>c==='rgb(255, 255, 255)'));document.querySelector('#result').textContent=JSON.stringify({passed,count:results.length,results});status.textContent='Layouts: '+(passed?'PASS':'FALHAS');frame.style.width='390px';await visit('/marcas/');}catch(e){status.textContent=e.message;}};
document.querySelector('#a11y').onclick=async()=>{const results=[];frame.style.width='390px';for(const path of routes)for(const width of [390,1280]){frame.style.width=width+'px';await visit(path);const d=frame.contentDocument,w=frame.contentWindow;await new Promise((resolve,reject)=>{const s=d.createElement('script');s.src='/__qa/axe.min.js';s.onload=resolve;s.onerror=reject;d.head.appendChild(s)});const r=await w.axe.run(d,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});results.push({path,width,axeVersion:w.axe.version,violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length}))});document.querySelector('#accessibility').textContent=JSON.stringify(results);status.textContent='Acessibilidade '+results.length+'/'+(routes.length*2);}status.textContent='Acessibilidade concluída';await visit('/marcas/');};
async function clickNavigate(a){await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Link timeout')),12000);frame.addEventListener('load',()=>{clearTimeout(t);resolve()},{once:true});a.click()});await ready();}
document.querySelector('#flows').onclick=async()=>{const r=[];frame.style.width='390px';try{for(const origin of ['/','/marcas/'])for(const slug of brands){await visit(origin);const a=frame.contentDocument.querySelector('a[data-brand="'+slug+'"]');await clickNavigate(a);r.push({origin,slug,passed:frame.contentWindow.location.pathname==='/marcas/'+slug+'/'});status.textContent='Jornadas '+r.length;}
await visit('/marcas/');const d=frame.contentDocument;const q=d.querySelector('#brand-query');q.value='eticos';q.dispatchEvent(new frame.contentWindow.Event('input',{bubbles:true}));r.push({name:'Busca sem acento',passed:d.querySelectorAll('.ba-directory-card:not([hidden])').length===1&& !d.querySelector('#eticos').hidden});q.value='';q.dispatchEvent(new frame.contentWindow.Event('input'));d.querySelector('[data-filter="verificacao"]').click();r.push({name:'Filtro de verificação',passed:d.querySelectorAll('.ba-directory-card:not([hidden])').length===3});d.querySelector('[data-filter="all"]').click();q.value='marca inexistente';q.dispatchEvent(new frame.contentWindow.Event('input'));r.push({name:'Estado vazio',passed:!d.querySelector('#brand-empty').hidden});
await visit('/marcas/landerlan/');const faq=frame.contentDocument.querySelector('#perguntas details');faq.querySelector('summary').click();r.push({name:'FAQ nativa',passed:faq.open});
await visit('/');const home=frame.contentDocument;r.push({name:'Comercial antes das ferramentas',passed:home.querySelector('#inicio').compareDocumentPosition(home.querySelector('#ferramentas'))===4});r.push({name:'Editorial antes das ferramentas',passed:home.querySelector('#ciencia').compareDocumentPosition(home.querySelector('#ferramentas'))===4});r.push({name:'WhatsApp preservado, sem envio',passed:[...home.querySelectorAll('[data-wa]')].every(a=>a.href.startsWith('https://wa.me/5521920043538'))});
const ctas=[...home.querySelectorAll('.lfx-hero-actions .hero-cta')].map(a=>a.getBoundingClientRect());r.push({name:'CTAs com áreas equivalentes e altura mínima 48',passed:ctas.length===2&&ctas.every(a=>a.height>=48)&&Math.abs(ctas[0].width-ctas[1].width)<1});
const menu=home.querySelector('#site-menu');menu.querySelector('summary').click();r.push({name:'Menu abre',passed:menu.open});menu.querySelector('summary').dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));r.push({name:'Menu fecha com Escape',passed:!menu.open});
const hq=home.querySelector('#brand-query');hq.value='Gold';hq.dispatchEvent(new frame.contentWindow.Event('input',{bubbles:true}));r.push({name:'Home busca linhas Gold',passed:[...home.querySelectorAll('[data-brand-name]')].filter(e=>!e.hidden).length>0&&[...home.querySelectorAll('[data-brand-name]')].filter(e=>!e.hidden).length<14});
const typeQuery=(input,value)=>{
 input.value=value;
 input.dispatchEvent(new frame.contentWindow.Event('input',{bubbles:true}));
};
const gallery=home.querySelector('.lfx-brands-navigation');
typeQuery(hq,'marca inexistente');
r.push({name:'Diretório sem resultados oculta a posição e desativa as setas',passed:gallery.hidden&&[...home.querySelectorAll('[data-brand-step]')].every(button=>button.disabled)});
typeQuery(hq,'');
r.push({name:'Limpar a busca restaura o progresso e as 14 marcas',passed:!gallery.hidden&&home.querySelectorAll('.lfx-brand-tile:not([hidden])').length===14});
home.querySelector('.search-toggle').click();
const siteQuery=home.querySelector('#site-query');
for(const [phrase,paths] of [
 ['orçamento',['/atacado/','/varejo/']],
 ['orcamento revenda',['/atacado/']],
 ['NUTRICAO',['/dieta/']],
 ['dados pessoais',['/privacidade']],
 ['termo inexistente',[]],
]){
 typeQuery(siteQuery,phrase);
 const found=[...home.querySelectorAll('.search-links a:not([hidden])')].map(link=>link.getAttribute('href'));
 r.push({name:'Busca do site por '+phrase,passed:JSON.stringify(found)===JSON.stringify(paths)});
}
typeQuery(siteQuery,'');
r.push({name:'Busca vazia restaura todos os destinos',passed:!home.querySelector('.search-links a[hidden]')});
home.querySelector('[data-search-close]').click();
r.push({name:'Transparência acessível',passed:!!home.querySelector('footer a[href="/equipe/"]')&&!!home.querySelector('footer a[href="/politica-editorial/"]')});
document.querySelector('#journeys').textContent=JSON.stringify({passed:r.every(x=>x.passed),results:r});status.textContent='Jornadas: '+(r.every(x=>x.passed)?'PASS':'FALHAS');await visit('/marcas/');}catch(e){status.textContent=e.message;document.querySelector('#journeys').textContent=JSON.stringify({error:e.message,results:r})}};
