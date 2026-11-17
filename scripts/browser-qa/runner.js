/* QA for the real local candidate in same-origin Chromium frames at CSS viewport sizes.
   It does not claim iPhone/Safari or mobile hardware emulation. */
const results=[],measurements=[],axeResults=[];let frame,doc,win;
const $=s=>doc.querySelector(s),pause=ms=>new Promise(r=>setTimeout(r,ms));
function check(name,ok,detail=''){results.push({name,passed:Boolean(ok),detail});document.querySelector('#results').textContent=results.map(x=>(x.passed?'PASS ':'FAIL ')+x.name+(x.detail?' — '+x.detail:'')).join('\n');}
async function until(fn,ms=8000){const end=Date.now()+ms;while(Date.now()<end){if(fn())return true;await pause(50)}return false}
function clearQAStorage(){for(const store of [localStorage,sessionStorage]){for(const key of Object.keys(store))if(/^(lr_|lander|nutrition)/i.test(key))store.removeItem(key)}}
async function load(path,width=390,consent='denied'){
 clearQAStorage();if(consent)localStorage.setItem('lr_measurement_consent_v20',consent);
 if(frame)frame.remove();frame=document.createElement('iframe');frame.title='Version candidate under test';frame.width=width;frame.height=844;
 const loaded=new Promise((resolve,reject)=>{frame.onload=resolve;setTimeout(()=>reject(Error('page load timeout '+path)),20000)});
 frame.src=path+(path.includes('?')?'&':'?')+'qa=1';document.querySelector('#stage').append(frame);await loaded;
 win=frame.contentWindow;doc=frame.contentDocument;await doc.fonts.ready;await Promise.all([...doc.images].filter(i=>i.loading!=='lazy').map(i=>i.decode().catch(()=>{})));await until(()=>[...doc.images].filter(i=>i.loading!=='lazy').every(i=>i.complete&&i.naturalWidth>0),4000);await pause(100);return doc;
}
function layout(path,width){const broken=[...doc.images].filter(i=>i.complete&&!i.naturalWidth);check(`Imagens ${path} @ ${width}`,broken.length===0,broken.map(i=>i.getAttribute('src')).join(', '));const overflow=doc.documentElement.scrollWidth-win.innerWidth;check(`Layout ${path} @ ${width}`,overflow<=1,`viewport=${win.innerWidth}; overflow=${overflow}px`);check(`JS ${path} @ ${width}`,win.__qa.errors.length===0,win.__qa.errors.join(';'));measurements.push({path,width:win.innerWidth,documentWidth:doc.documentElement.scrollWidth,height:doc.documentElement.scrollHeight,resourceErrors:win.__qa.resourceErrors||[],brokenImages:[...doc.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src'))});}
async function axe(path){const script=doc.createElement('script');script.src='/__qa/axe.min.js';const ready=new Promise(r=>script.onload=r);doc.head.append(script);await ready;const result=await win.axe.run(doc,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});const violations=result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));axeResults.push({path,violations,incomplete:result.incomplete.length});check('Acessibilidade automática '+path,!violations.some(v=>['serious','critical'].includes(v.impact)),violations.map(v=>v.id+':'+v.impact).join(', ')||'Nenhuma violação detectada')}
function click(s){const el=$(s);if(!el)throw Error('Missing '+s);el.click()}
function fill(s,value){const el=$(s);el.value=value;el.dispatchEvent(new win.Event('input',{bubbles:true}));el.dispatchEvent(new win.Event('change',{bubbles:true}))}
async function training(){
 await load('/treino/');for(let i=0;i<3;i++)click('#next-btn');click('#submit-btn');await pause(80);
 check('Treino: prévia antes de qualquer envio',!$('#lead-gate').hidden&&$('#training-preview-exercises').children.length===3&&win.__qa.requests.length===0);
 click('#gate-unlock');check('Treino: campos inválidos não enviam',win.__qa.requests.length===0&&!$('#lead-feedback').hidden);
 fill('#training-lead-name','Teste de qualidade');fill('#training-lead-whatsapp','21999999999');fill('#training-lead-email','qa@example.invalid');$('[name=consent_access]').checked=true;
 for(const mode of ['failure','invalid','success']){win.__qa.apiMode=mode;click('#gate-unlock');await until(()=>!$('#gate-unlock').disabled);check('Treino: '+mode,mode==='success'?$('#lead-gate').hidden:!$('#lead-gate').hidden&&$('#training-lead-email').value==='qa@example.invalid')}
 const body=JSON.parse(win.__qa.requests.at(-1).body);check('Treino: envio mínimo e marketing opcional',body.consent_marketing===false&&!['peso','altura','objetivo','profile','plan'].some(k=>k in body),Object.keys(body).join(', '));check('Treino: sem erros JS',win.__qa.errors.length===0,win.__qa.errors.join(';'));await axe('/treino/ resultado');
}
async function nutrition(){
 await load('/dieta/');click('#demoBtn');for(let i=0;i<8;i++){click('#nextBtn');await pause(30);if(!$('[data-view=gate]').hidden)break}
 check('Dieta: prévia antes de qualquer envio',!$('[data-view=gate]').hidden&&$('#nutrition-preview-foods').children.length>0&&win.__qa.requests.length===0);
 click('#leadForm button[type=submit]');check('Dieta: campos inválidos não enviam',win.__qa.requests.length===0);
 fill('#field-name','Teste de qualidade');fill('#field-whatsapp','21999999999');fill('#field-email','qa@example.invalid');$('#leadForm [name=consent_access]').checked=true;
 for(const mode of ['failure','invalid','success']){win.__qa.apiMode=mode;click('#leadForm button[type=submit]');await until(()=>!$('#leadForm button[type=submit]').disabled);check('Dieta: '+mode,mode==='success'?!$('[data-view=results]').hidden:!$('[data-view=gate]').hidden&&$('#field-email').value==='qa@example.invalid')}
 const body=JSON.parse(win.__qa.requests.at(-1).body);check('Dieta: envio mínimo e marketing opcional',body.consent_marketing===false&&!['weight','height','profile','plan','calories'].some(k=>k in body),Object.keys(body).join(', '));check('Dieta: sem erros JS',win.__qa.errors.length===0,win.__qa.errors.join(';'));await axe('/dieta/ resultado');
}
async function run(){
 results.length=0; measurements.length=0; axeResults.length=0;
 let release=null;
 document.querySelector('#run').disabled=true;document.querySelector('#status').textContent='Executando…';const started=new Date().toISOString();
 try{
  const response=await fetch('/release.json',{cache:'no-store'});
  if(!response.ok)throw Error('Release metadata unavailable');
  const metadata=await response.json();
  if(typeof metadata.version!=='string'||!metadata.version.trim())throw Error('Release version unavailable');
  release=metadata.version;
  const paths=await (await fetch('/__qa/routes.json')).json();
  for(const width of [320,390,768,1440])for(const path of paths){document.querySelector('#status').textContent=`Verificando ${path} em ${width}px`;await load(path,width);layout(path,width);if(width===390)await axe(path)}
  await load('/',390,null);const box=$('#lr-privacy').getBoundingClientRect();check('Consentimento visível na primeira tela',box.top>=0&&box.bottom<=win.innerHeight&&win.getComputedStyle($('#lr-privacy')).position==='fixed',JSON.stringify({top:box.top,bottom:box.bottom,height:box.height}));check('Zero eventos antes de consentir',win.LanderMeasurement.getSnapshot().length===0);await axe('/ consentimento');click('[data-choice=denied]');check('Recusa respeitada',win.LanderMeasurement.getConsent()==='denied'&&!$('#lr-privacy'));click('[data-privacy-open]');click('[data-choice=granted]');check('Aceite registra uma visita',win.LanderMeasurement.getSnapshot().filter(e=>e.event==='site_visit').length===1);click('[data-privacy-open]');click('[data-choice=denied]');check('Revogação interrompe medição',!win.LanderMeasurement.isEnabled()&&win.LanderMeasurement.getSnapshot().length===0);
  click('#site-menu summary');check('Menu móvel abre',$('#site-menu').open);doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));check('Escape fecha menu e devolve foco',!$('#site-menu').open&&doc.activeElement===$('#site-menu summary'));
  click('[data-rox-launcher]');for(const [q,path] of [['Dieta','/dieta/'],['Treino','/treino/'],['sono','/conteudos/']]){fill('[data-rox-input]',q);$('[data-rox-form]').requestSubmit();await pause(30);const links=[...doc.querySelectorAll('.lr-rox-actions a')];check('ROX link '+q,links.at(-1)?.getAttribute('href')===path)}
  fill('[data-rox-input]','dose de testosterona 15mg');$('[data-rox-form]').requestSubmit();await pause(50);check('ROX: pergunta clínica sem venda',$('[data-rox-handoff]').hidden);await axe('/ ROX aberto');
  for(const [path,name] of [['/conteudos/diario-de-treino-como-registrar/','diario-de-treino'],['/conteudos/planejar-compras-refeicoes-semana/','lista-de-compras-semanal']]){
   await load(path,390,'granted');const a=$('a[download]');check('Download público '+name,Boolean(a)&&!a.closest('[hidden]'));const r=await fetch(a.href),content=await r.text();check('CSV válido '+name,r.ok&&content.includes(';')&&content.split('\n').length>=16&&!content.includes('<html'));
   a.addEventListener('click',e=>e.preventDefault());a.click();const e=win.LanderMeasurement.getSnapshot().at(-1);check('Clique de recurso identificado '+name,e.event==='cta_interaction'&&e.action==='download-'+name+'-csv');
  }
  await training();await nutrition();
 }catch(e){check('Execução completa',false,String(e.stack||e))}
 const report={release,started,finished:new Date().toISOString(),engine:navigator.userAgent,scope:'Local Chromium, CSS viewport frames; simulated API responses; no production writes',status:results.every(r=>r.passed)?'PASS':'FAIL',results,measurements,axe:axeResults};
 await fetch('/__qa/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});document.querySelector('#status').textContent=`${report.status} — ${results.filter(r=>r.passed).length}/${results.length} verificações. Relatório salvo.`;document.querySelector('#run').disabled=false;
}
document.querySelector('#run').addEventListener('click',run);
