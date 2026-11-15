/* Temporary browser QA, exercised through visible controls. Never deployed. */
const brandOutput=document.createElement('pre');brandOutput.id='brand-report';brandOutput.hidden=true;document.body.append(brandOutput);
const brandAxeOutput=document.createElement('pre');brandAxeOutput.id='brand-axe-report';brandAxeOutput.hidden=true;document.body.append(brandAxeOutput);
const settle=()=>new Promise(resolve=>setTimeout(resolve,80));
async function visit(path){await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Navigation timeout: '+path)),15000);frame.addEventListener('load',()=>{clearTimeout(timer);resolve()},{once:true});frame.src=path});await frame.contentDocument.fonts.ready;await Promise.allSettled([...frame.contentDocument.images].map(i=>{i.loading='eager';return i.decode()}));await settle();}
function snapshot(){const d=frame.contentDocument,w=frame.contentWindow;return {path:w.location.pathname,release:d.querySelector('[name="lander-release"]')?.content,width:w.innerWidth,contentWidth:d.documentElement.scrollWidth,overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth,h1:d.querySelector('h1')?.textContent.trim(),broken:[...d.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')),backgrounds:[...d.querySelectorAll('.lfx-brand-art,.ba-logo-canvas,.ba-showcase')].map(el=>w.getComputedStyle(el).backgroundColor),productCount:d.querySelectorAll('.ba-product').length,smallTargets:[...d.querySelectorAll('a,button,summary')].filter(el=>el.getClientRects().length).filter(el=>{const r=el.getBoundingClientRect();return r.width<24||r.height<24}).map(el=>el.textContent.trim().slice(0,60))};}
document.querySelector('#brands').onclick=async()=>{
 auditState.textContent='Preparando imagens e fontes';
 const result={candidate:'digital-flagship-2026-rc6.3',scope:'Chromium iframe, real local navigation; no external messages',navigation:[],layouts:[],canvases:[]};
 try{
  await visit('/');const cards=[...frame.contentDocument.querySelectorAll('[data-brand]')].map(a=>({slug:a.dataset.brand,name:a.dataset.brandName,path:a.getAttribute('href')}));
  for(const width of [320,360,390,430,1280]){frame.style.width=width+'px';await settle();await Promise.allSettled([...frame.contentDocument.images].map(i=>i.decode()));await settle();result.layouts.push(snapshot());}
  result.canvases.push(snapshot());
  frame.style.width='390px';
  for(const [i,brand] of cards.entries()){
   auditState.textContent='Marca '+(i+1)+'/14: '+brand.name;await visit('/');
   await new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});frame.contentDocument.querySelector('[data-brand="'+brand.slug+'"]').click()});
   await frame.contentDocument.fonts.ready;await Promise.allSettled([...frame.contentDocument.images].map(i=>i.decode()));
   const d=frame.contentDocument,w=frame.contentWindow;
   result.navigation.push({slug:brand.slug,expected:brand.path,actual:w.location.pathname,h1:d.querySelector('h1')?.textContent.trim(),passed:w.location.pathname===brand.path&&d.querySelector('h1')?.textContent.trim()===brand.name});
   for(const width of [320,360,390,430,1280]){frame.style.width=width+'px';await settle();await Promise.allSettled([...frame.contentDocument.images].map(i=>i.decode()));await settle();result.layouts.push(snapshot());}
   result.canvases.push(snapshot());
  }
  await visit('/marcas/');for(const width of [320,360,390,430,1280]){frame.style.width=width+'px';await settle();await Promise.allSettled([...frame.contentDocument.images].map(i=>i.decode()));await settle();result.layouts.push(snapshot());}
  result.canvases.push(snapshot());
  result.passed=result.navigation.every(x=>x.passed)&&result.layouts.every(x=>!x.overflow&&!x.broken.length&&x.release===result.candidate)&&result.canvases.every(x=>x.backgrounds.every(c=>c==='rgb(255, 255, 255)'));
  brandOutput.textContent=JSON.stringify(result,null,2);auditState.textContent=result.passed?'14 marcas: PASS':'Marcas: falhas';
  frame.style.width='390px';await visit('/marcas/landerlan/');
 }catch(e){result.error=e.message;brandOutput.textContent=JSON.stringify(result,null,2);auditState.textContent='Erro: '+e.message;}
};
document.querySelector('#brands-axe').onclick=async()=>{
 const results=[];await visit('/marcas/');const paths=['/marcas/',...[...frame.contentDocument.querySelectorAll('[data-brand]')].map(a=>a.getAttribute('href'))];frame.style.width='390px';
 for(const [i,path] of paths.entries()){auditState.textContent='Acessibilidade '+(i+1)+'/'+paths.length;await visit(path);try{results.push(await auditCurrent())}catch(e){results.push({path,error:e.message})}brandAxeOutput.textContent=JSON.stringify(results,null,2);}
 auditState.textContent='Acessibilidade das marcas concluída';await visit('/marcas/landerlan/');
};
