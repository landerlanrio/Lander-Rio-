/* Digital Flagship 2026: progressive enhancement; no remote data or persistent input. */
(()=>{'use strict';
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const dialog=$('#search-dialog'),open=$('.search-toggle'),close=$('[data-search-close]'),query=$('#site-query');
 function filterSearch(){const term=normalize(query.value);let count=0;$$('.search-links a').forEach(a=>{a.hidden=!normalize(a.textContent).includes(term);if(!a.hidden)count++});$('.search-status').textContent=count?`${count} caminho${count===1?'':'s'} encontrado${count===1?'':'s'}.`:'Nenhum resultado. Tente outra palavra.';}
 open?.addEventListener('click',()=>{dialog.showModal();query.focus();filterSearch()});
 close?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close()}});
 dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 dialog?.addEventListener('close',()=>open.focus());query?.addEventListener('input',filterSearch);
 $('#brand-query')?.addEventListener('input',e=>{const q=normalize(e.target.value);let count=0;$$('.brand-grid .brand-tile').forEach(li=>{li.hidden=!normalize(li.dataset.brandName).includes(q);if(!li.hidden)count++});$('#brand-results').textContent=`${count} marca${count===1?'':'s'} encontrada${count===1?'':'s'}.`;$('.gallery-empty').hidden=count!==0;});
 document.addEventListener('click',e=>{const a=e.target.closest('[data-brand]');if(a)window.LanderMeasurement?.push('brand_interaction',{placement:a.closest('.hero')?'hero':'brand-directory'});const profile=e.target.closest('.hero-cta');if(profile)window.LanderMeasurement?.push(profile.dataset.profile==='atacado'?'wholesale_selected':'retail_selected',{profile:profile.dataset.profile,placement:'hero'});});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const connection=navigator.connection;const lowPower=connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<4);
 let heroSeen=false,heroVisible=false,ticking=false;
 function measureHero(){if(heroSeen||!heroVisible)return;if(window.LanderMeasurement?.push('hero_view',{placement:'hero'}))heroSeen=true;}
 const hero=$('#inicio');
 if('IntersectionObserver' in window&&hero){new IntersectionObserver(([e])=>{heroVisible=e.isIntersecting;measureHero()},{threshold:.2}).observe(hero);window.addEventListener('lander:consent',measureHero);}
 else{heroVisible=true;measureHero();}
 // Only animate decorative layers on capable pointer devices; touch uses the static composition.
 function updateDepth(){ticking=false;if(reduced.matches||!fine.matches||lowPower||document.hidden)return;const stage=$('.hero-stage'),r=stage.getBoundingClientRect();if(r.bottom>0)stage.style.setProperty('--hero-shift',Math.min(40,Math.max(0,-r.top*.1))+'px');}
 if(!lowPower){window.addEventListener('scroll',()=>{if(!ticking&&fine.matches&&!reduced.matches){ticking=true;requestAnimationFrame(updateDepth)}},{passive:true});
 $$('.brand-tile a').forEach(tile=>{tile.addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches)return;const r=tile.getBoundingClientRect();tile.style.setProperty('--tilt-x',((e.clientX-r.left)/r.width-.5)*6+'deg');tile.style.setProperty('--tilt-y',-((e.clientY-r.top)/r.height-.5)*5+'deg');});tile.addEventListener('pointerleave',()=>{tile.style.removeProperty('--tilt-x');tile.style.removeProperty('--tilt-y')});});}
 reduced.addEventListener?.('change',()=>{$('.hero-stage')?.style.removeProperty('--hero-shift');$$('.brand-tile a').forEach(t=>{t.style.removeProperty('--tilt-x');t.style.removeProperty('--tilt-y')})});
 // Keep the mobile menu keyboard-accessible and restore focus on escape using the existing controller.
 const menu=$('.menu-toggle');document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!document.body.classList.contains('menu-open'))return;const nodes=[...$$('.main-nav a'),$('.search-toggle'),menu].filter(Boolean),first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
})();
