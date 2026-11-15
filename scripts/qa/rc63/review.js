const pause=ms=>new Promise(r=>setTimeout(r,ms));
const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};
document.querySelector('#matrix').onclick=async()=>{
 const results=[],d=frame.contentDocument,w=frame.contentWindow;
 auditState.textContent='Testando larguras';
 for(const [width,height] of [[320,667],[360,740],[390,844],[430,844],[1280,844]]){
  frame.style.width=width+'px';frame.style.height=height+'px';w.scrollTo(0,0);await d.fonts.ready;await pause(150);
  const buttons=[...d.querySelectorAll('#inicio .hero-cta')].map(e=>({profile:e.dataset.profile,rect:box(e),fontPx:parseFloat(w.getComputedStyle(e).fontSize),href:e.getAttribute('href')}));
  const loaded=[...d.images].filter(e=>e.complete);
  results.push({viewport:[w.innerWidth,w.innerHeight],release:d.querySelector('[name="lander-release"]').content,scrollWidth:d.documentElement.scrollWidth,overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth,heroBrandCount:d.querySelectorAll('#inicio .brand-mark').length,galleryBrandCount:d.querySelectorAll('#brand-track img').length,h1:d.querySelectorAll('h1').length,heroImage:d.querySelector('.lfx-hero-photo img').currentSrc,brokenLoadedImages:loaded.filter(e=>e.naturalWidth===0).map(e=>e.getAttribute('src')),buttons,buttonsMeet44px:buttons.every(x=>x.rect.width>=44&&x.rect.height>=44),buttonsWithinViewport:buttons.every(x=>x.rect.x>=0&&x.rect.right<=width&&x.rect.bottom<=height),privacyNotice:d.querySelector('#lr-privacy')?box(d.querySelector('#lr-privacy')):null});
 }
 document.querySelector('#matrix-report').textContent=JSON.stringify({scope:'Local Chromium iframe; not physical iPhone or production',results},null,2);
 frame.style.width='390px';frame.style.height='844px';size.value='390';document.querySelector('#height').value='844';auditState.textContent='Matriz concluída';
};
document.querySelector('#flows').onclick=async()=>{
 const d=frame.contentDocument,w=frame.contentWindow,results=[];
 const check=(name,pass,detail)=>results.push({name,pass,detail});
 const summary=d.querySelector('#site-menu summary');summary.click();check('menu opens',d.querySelector('#site-menu').open);d.querySelector('#site-menu a[href="#marcas"]').click();check('menu closes after navigation',!d.querySelector('#site-menu').open);await pause(100);
 d.querySelector('[data-brand-step="1"]').click();await pause(500);check('gallery advances',d.querySelector('#brand-track').scrollLeft>0,{scrollLeft:d.querySelector('#brand-track').scrollLeft});
 const query=d.querySelector('#brand-query');query.closest('details').open=true;query.value='Landerlan';query.dispatchEvent(new w.Event('input',{bubbles:true}));check('brand filter returns Landerlan',d.querySelectorAll('.lfx-brand-tile:not([hidden])').length===1);query.value='';query.dispatchEvent(new w.Event('input',{bubbles:true}));query.closest('details').open=false;check('brand filter restores 14',d.querySelectorAll('.lfx-brand-tile:not([hidden])').length===14);
 d.querySelector('#universe-tab-1').click();check('nutrition tab and route',d.querySelector('#universe-tab-1').getAttribute('aria-selected')==='true'&&d.querySelector('#universe-link').getAttribute('href')==='/dieta/');d.querySelector('#universe-tab-0').click();
 d.querySelector('.search-toggle').click();check('search opens',d.querySelector('#search-dialog').open);d.querySelector('[data-search-close]').click();check('search closes',!d.querySelector('#search-dialog').open);
 const links=[...d.querySelectorAll('#inicio [data-wa]')];check('distinct WhatsApp contexts',links.length===2&&links[0].href!==links[1].href&&links.every(x=>new URL(x.href).host==='wa.me'));
 const generic=d.querySelector('.lfx-contact-cta');check('generic contact does not assign retail',generic.dataset.profile==='geral'&&!new URL(generic.href).searchParams.get('text').includes('no varejo'));
 document.querySelector('#flow-report').textContent=JSON.stringify({scope:'Local browser interaction only; no form submission or external message',results},null,2);w.scrollTo(0,0);auditState.textContent='Interações concluídas';
};
