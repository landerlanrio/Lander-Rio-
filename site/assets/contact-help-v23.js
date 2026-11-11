/* Explicit, user-initiated copy only. Never sends a message or stores typed city data. */
(()=>{'use strict';
 const phone='+55 21 92004-3538';
 async function copy(text){
  if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(text);return true}catch{}}
  const previous=document.activeElement,area=document.createElement('textarea');
  area.value=text;area.setAttribute('readonly','');area.setAttribute('aria-label','Texto para copiar');
  area.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
  document.body.append(area);area.select();area.setSelectionRange(0,area.value.length);
  let ok=false;try{ok=document.execCommand('copy')}catch{}finally{area.remove();previous?.focus({preventScroll:true})}
  return ok;
 }
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-copy-contact]');if(!button)return;
  const message=button.dataset.copyContact==='message';
  const text=message?document.querySelector('#message-preview')?.textContent.trim():phone;
  const status=button.parentElement.querySelector('[role="status"]');
  if(!text){status.textContent='O texto não está disponível. Use o número exibido acima.';return}
  const restoreFocus=document.activeElement===button;
  button.disabled=true;const ok=await copy(text);button.disabled=false;
  if(restoreFocus)button.focus({preventScroll:true});
  status.textContent=ok?(message?'Mensagem copiada. Você decide onde colar e enviar.':'Número copiado: '+phone):'Não foi possível copiar automaticamente. Selecione o texto exibido acima.';
 });
})();
