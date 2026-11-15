/* Small progressive navigation; no telemetry, storage or external requests. */
(()=>{'use strict';
 const menu=document.querySelector('#site-menu');
 if(menu){
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
  document.addEventListener('click',event=>{if(menu.open&&(!menu.contains(event.target)||event.target.closest('a')))menu.open=false;});
 }
 const path=location.pathname.replace(/\/$/,'')||'/';
 document.querySelectorAll('.lr-header nav a').forEach(a=>{if((new URL(a.href).pathname.replace(/\/$/,'')||'/')===path)a.setAttribute('aria-current','page');});
})();
