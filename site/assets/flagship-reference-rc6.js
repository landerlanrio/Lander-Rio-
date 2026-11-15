/* Native enhancement of the user-selected MagicPath design. No framework, external requests or stored input. */
(()=>{'use strict';
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const lowPower=navigator.connection?.saveData||['slow-2g','2g'].includes(navigator.connection?.effectiveType)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<4);
 if(lowPower)document.documentElement.classList.add('low-motion');
 const menu=$('#site-menu'),summary=menu?.querySelector('summary');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented&&menu?.open){menu.open=false;summary.focus();}});
 document.addEventListener('click',e=>{if(menu?.open&&(!menu.contains(e.target)||e.target.closest('a')))menu.open=false;});
 const dialog=$('#search-dialog'),open=$('.search-toggle'),query=$('#site-query');
 const filterSearch=()=>{const q=normalize(query.value);let count=0;$$('.search-links a').forEach(a=>{a.hidden=!normalize(a.textContent).includes(q);if(!a.hidden)count++;});$('.search-status').textContent=count?`${count} caminho${count===1?'':'s'} encontrado${count===1?'':'s'}.`:'Nenhum resultado. Tente outra palavra.';};
 open?.addEventListener('click',()=>{dialog.showModal();query.focus();filterSearch();});
 $('[data-search-close]')?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('close',()=>open.focus());query?.addEventListener('input',filterSearch);
 dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});

 const track=$('#brand-track'),progress=$('.lfx-brands-progress-track'),label=$('.lfx-brands-navigation>span');
 function updateGallery(){
  if(!track)return;const max=Math.max(0,track.scrollWidth-track.clientWidth),ratio=max?Math.min(1,Math.max(0,track.scrollLeft/max)):0;
  const visible=$$('.lfx-brand-tile').filter(e=>!e.hidden),columns=Math.max(1,Math.ceil(visible.length/2));
  progress?.setAttribute('aria-valuenow',String(Math.round(ratio*100)));if(progress?.firstElementChild)progress.firstElementChild.style.width=(max?Math.max(12,ratio*100):100)+'%';
  if(label)label.textContent=`${String(Math.min(columns,1+Math.round(ratio*(columns-1)))).padStart(2,'0')} / ${String(columns).padStart(2,'0')}`;
  const prev=$('[data-brand-step="-1"]'),next=$('[data-brand-step="1"]');if(prev)prev.disabled=track.scrollLeft<=1;if(next)next.disabled=max-track.scrollLeft<=1;
 }
 function moveGallery(direction){if(!track)return;const tile=track.querySelector('.lfx-brand-tile:not([hidden])');const step=(tile?.getBoundingClientRect().width||220)+parseFloat(getComputedStyle(track).columnGap||'13');track.scrollBy({left:direction*step,behavior:reduced.matches||lowPower?'auto':'smooth'});}
 $$('[data-brand-step]').forEach(b=>b.addEventListener('click',()=>moveGallery(Number(b.dataset.brandStep))));
 track?.addEventListener('scroll',updateGallery,{passive:true});window.addEventListener('resize',updateGallery,{passive:true});
 track?.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveGallery(e.key==='ArrowRight'?1:-1);}if(e.key==='Home'||e.key==='End'){e.preventDefault();track.scrollTo({left:e.key==='Home'?0:track.scrollWidth,behavior:'auto'});}});
 $('#brand-query')?.addEventListener('input',e=>{const q=normalize(e.target.value);let count=0;$$('.lfx-brand-tile').forEach(a=>{a.hidden=!normalize(a.dataset.search||a.dataset.brandName).includes(q);if(!a.hidden)count++;});$('#brand-results').textContent=count?`${count} marca${count===1?'':'s'} encontrada${count===1?'':'s'}.`:'Nenhuma marca encontrada.';track.scrollLeft=0;updateGallery();});
 updateGallery();

 const panels=[
  {eyebrow:'CIÊNCIA / MOVIMENTO',heading:'FORÇA NÃO É ACASO.',copy:'Mais que séries e repetições: técnica, progressão e consistência para evoluir com inteligência.',image:'training',href:'/treino/',cta:'EXPLORAR TREINO'},
  {eyebrow:'HÁBITOS / NUTRIÇÃO',heading:'RESULTADO É MÉTODO.',copy:'Organize refeições, substituições e compras. Recursos educativos para apoiar uma rotina mais consistente.',image:'nutrition',href:'/dieta/',cta:'EXPLORAR ALIMENTAÇÃO'},
  {eyebrow:'PESSOAS / CULTURA',heading:'VIVER É EVOLUIR.',copy:'Performance é uma cultura que vai além dos aparelhos, da academia e dos números.',image:'culture',href:'/conteudos/',cta:'EXPLORAR O EDITORIAL'}
 ];
 function selectTab(index,focus=false){const data=panels[index];if(!data)return;$$('[data-tab]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;b.classList.toggle('active',i===index);b.lastElementChild.textContent=i===index?'●':'↗';if(i===index&&focus)b.focus();});$('#universe-panel').setAttribute('aria-labelledby','universe-tab-'+index);$('.lfx-universe-content>small').textContent=data.eyebrow;$('.lfx-universe-content>h3').textContent=data.heading;$('.lfx-universe-content>p').textContent=data.copy;$('.lfx-universe-photo').className='lfx-universe-photo lfx-panel-'+data.image;$('#universe-link').href=data.href;$('#universe-link').firstChild.textContent=data.cta+' ';}
 $$('[data-tab]').forEach((b,index)=>{b.addEventListener('click',()=>selectTab(index));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%3;if(e.key==='ArrowLeft')next=(index+2)%3;if(e.key==='Home')next=0;if(e.key==='End')next=2;if(next!==undefined){e.preventDefault();selectTab(next,true);}});});
 $$('[data-rox-open]').forEach(b=>b.addEventListener('click',()=>{const launcher=$('[data-rox-launcher]');if(launcher&&launcher.getAttribute('aria-expanded')!=='true')launcher.click();}));
 document.addEventListener('click',e=>{const brand=e.target.closest('[data-brand]');if(brand)window.LanderMeasurement?.push('brand_interaction',{placement:brand.closest('#inicio')?'hero':'brand-directory'});const profile=e.target.closest('.hero-cta');if(profile)window.LanderMeasurement?.push(profile.dataset.profile==='atacado'?'wholesale_selected':'retail_selected',{profile:profile.dataset.profile,placement:'hero'});});
 let heroSeen=false,heroVisible=false;const measureHero=()=>{if(!heroSeen&&heroVisible&&window.LanderMeasurement?.push('hero_view',{placement:'hero'}))heroSeen=true;};
 if('IntersectionObserver' in window){new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;measureHero();},{threshold:.2}).observe($('#inicio'));window.addEventListener('lander:consent',measureHero);
  const animationObserver=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('lfx-in-view',e.isIntersecting)),{rootMargin:'100px'});$$('.lfx-marquee,.lfx-rox').forEach(e=>animationObserver.observe(e));}
 const updateGuide=()=>{document.body.classList.toggle('rox-ready',Boolean($('#ferramentas')&&$('#ferramentas').getBoundingClientRect().top<window.innerHeight-80));};updateGuide();window.addEventListener('scroll',updateGuide,{passive:true});window.addEventListener('resize',updateGuide,{passive:true});
})();
