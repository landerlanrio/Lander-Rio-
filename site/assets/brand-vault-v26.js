/* LANDER RIO — Brand Vault navigation, filtered locally. No network, storage or analytics. */
(()=>{'use strict';
 const group=document.querySelector('.v26-filters');
 const grid=document.querySelector('.v26-brand-grid');
 const status=document.querySelector('[data-v26-results]');
 if(!group||!grid||!status)return;
 const cards=Array.from(grid.querySelectorAll('.v26-brand-card'));
 const filters=Array.from(group.querySelectorAll('[data-v26-filter]'));
 const apply=(category)=>{
  if(!filters.some(btn=>btn.dataset.v26Filter===category))return;
  let count=0;
  cards.forEach(card=>{const show=category==='todas'||card.dataset.category===category;card.hidden=!show;if(show)count++});
  filters.forEach(btn=>{const active=btn.dataset.v26Filter===category;btn.classList.toggle('is-active',active);btn.setAttribute('aria-pressed',String(active))});
  status.textContent=`Exibindo ${count} ${count===1?'marca':'marcas'} do diretório.`;
 };
 group.addEventListener('click',event=>{const btn=event.target.closest('button[data-v26-filter]');if(btn)apply(btn.dataset.v26Filter)});
 const toggle=document.querySelector('.v26-search-toggle');
 const panel=document.querySelector('#v26-search');
 const query=document.querySelector('#v26-query');
 const close=panel?.querySelector('[data-v26-search-close]');
 const searchStatus=panel?.querySelector('[data-v26-search-status]');
 const menu=document.querySelector('.menu-toggle');
 const normalize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const links=Array.from(panel?.querySelectorAll('.v26-search-links a')||[]);
 function filterSearch(){const q=normalize(query?.value);let count=0;links.forEach(a=>{a.hidden=Boolean(q&&!normalize(a.textContent).includes(q));if(!a.hidden)count++});if(searchStatus)searchStatus.textContent=!q?'':count?`${count} ${count===1?'área encontrada':'áreas encontradas'}.`:'Nenhuma área encontrada. Tente treino, dieta, marcas ou atendimento.';}
 function searchOpen(open,restore=true){
  if(!toggle||!panel)return;
  if(open){document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Abrir menu');document.dispatchEvent(new Event('lander:menu-change'));}
  panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
  if(open)query?.focus();else{if(query)query.value='';filterSearch();if(restore)toggle.focus();}
 }
 toggle?.addEventListener('click',()=>searchOpen(panel.hidden));
 close?.addEventListener('click',()=>searchOpen(false));
 menu?.addEventListener('click',()=>{if(panel&&!panel.hidden)searchOpen(false,false)});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden){event.preventDefault();searchOpen(false)}});
 query?.addEventListener('input',filterSearch);
 links.forEach(a=>a.addEventListener('click',()=>{if(panel&&!panel.hidden)searchOpen(false)}));
 apply('todas');
})();
