/* First-party request receipt. Contact fields never enter analytics or browser storage. */
(()=>{'use strict';
const key='lr_commercial_origin_v1', paths=new Set(['/','/varejo/','/atacado/','/contato/','/marcas/']);
const safePath=p=>paths.has(p)?p:'/';
function origin(){let previous={};try{previous=JSON.parse(sessionStorage.getItem(key)||'{}')}catch{}
 if(!previous||typeof previous!=='object'||Array.isArray(previous))previous={};
 const value={entry_path:safePath(previous.entry_path||location.pathname),page_path:safePath(location.pathname)};
 const q=new URLSearchParams(location.search),sources=['instagram','whatsapp','google','facebook','tiktok','direct'],mediums=['social','organic','cpc','referral','bio','story','reel','paid_social','organic_social'];
 const explicit=['utm_source','utm_medium','utm_campaign'].some(k=>q.has(k));
 const read=k=>explicit?q.get(k):previous[k];let source=read('utm_source');if(source==='ig')source='instagram';if(source==='fb')source='facebook';
 if(sources.includes(source))value.utm_source=source;if(mediums.includes(read('utm_medium')))value.utm_medium=read('utm_medium');if(/^lr-\d{6,12}$/.test(read('utm_campaign')||''))value.utm_campaign=read('utm_campaign');
 try{sessionStorage.setItem(key,JSON.stringify(value))}catch{}return value;
}
const attribution=origin();
const receiptFormat = /^LR-[A-F0-9]{32}$/;
const requestIdFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fieldErrors = new Map([
 ['invalid_email', ['email', 'Confira o e-mail para retorno. Use um endereço completo, como nome@exemplo.com.']],
 ['invalid_name', ['name', 'Revise o nome ou deixe esse campo em branco. Use até 80 caracteres e evite os sinais < e >.']],
 ['privacy_required', ['privacy_ack', 'Confirme a leitura da política de privacidade para enviar sua solicitação.']]
]);
for(const form of document.querySelectorAll('[data-commercial-request]')){
 const fields=form.querySelector('fieldset'),button=form.querySelector('button[type=submit]'),status=form.querySelector('[role=status]');let pending=false,complete=false,payload=null;
 const storageKey='lr_commercial_request_id_'+form.dataset.profile;let id;try{id=sessionStorage.getItem(storageKey)}catch{}if(!requestIdFormat.test(id||''))id=crypto.randomUUID();try{sessionStorage.setItem(storageKey,id)}catch{}
 form.addEventListener('input', event => event.target.removeAttribute('aria-invalid'));
 form.addEventListener('submit',async event=>{event.preventDefault();if(pending||complete)return;if(!payload&&!form.reportValidity())return;
 if(!payload){const f=new FormData(form);payload={request_id:id,profile:form.dataset.profile,intent:f.get('intent'),name:String(f.get('name')||'').trim(),email:String(f.get('email')||'').trim(),origin:attribution,privacy_ack:f.get('privacy_ack')==='on',website:f.get('website')||''};}
 pending=true;fields.disabled=true;button.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Salvando sua solicitação… Aguarde o protocolo.';
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const response=await fetch('/api/commercial/lead',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload),signal:controller.signal});let result;try{result=await response.json()}catch{throw new Error('unconfirmed')}
 if(!response.ok||result.ok!==true||result.saved!==true||!receiptFormat.test(result.receipt||'')){
 if(response.status===400){
  payload=null;
  fields.disabled=false;
  const issue=fieldErrors.get(result.error);
  status.textContent=issue ? issue[1] : 'Confira os campos e a confirmação de privacidade antes de enviar.';
  if(issue){
   const field=form.elements.namedItem(issue[0]);
   field.setAttribute('aria-invalid','true');
   field.focus();
  }
 }else if(response.status===409){payload=null;fields.disabled=false;status.textContent='Os dados diferem do envio anterior desta aba. Repita os dados originais para recuperar o protocolo ou fale com a equipe. Nenhum novo registro foi criado.';button.textContent='Conferir dados e tentar novamente';}else throw new Error('unconfirmed');
 }else{complete=true;status.textContent='Solicitação recebida e salva. Protocolo '+result.receipt+'. A equipe poderá localizar seu interesse e responder pelo e-mail informado.';button.textContent='Solicitação recebida';try{sessionStorage.removeItem(storageKey)}catch{}}
 }catch{status.textContent='Ainda não foi possível confirmar o recebimento. Tente novamente: repetiremos a mesma solicitação para evitar duplicidade. Seus dados permanecem nesta tela.';button.textContent='Tentar novamente';}
 finally{clearTimeout(timer);pending=false;button.disabled=complete;form.setAttribute('aria-busy','false');}
 if (complete) {
   // The receipt is already committed and displayed. Telemetry is best effort.
   try {
     window.LanderMeasurement?.push('commercial_request_saved', {
       profile: payload.profile,
       backend_confirmed: true
     });
   } catch {}
 }
 });
 // Expose the form only after JSON submission has a handler.
 form.hidden = false;
 form.closest('.commercial-request').querySelector('[data-request-fallback]').hidden = true;
}
})();
