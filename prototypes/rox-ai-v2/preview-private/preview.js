/* ROX 3.0 PRIVATE PREVIEW — browser → local adapter → actual backend handler.
 * No third-party URLs, production endpoints, tracking, credentials or automatic handoff.
 */
(() => {
 'use strict';
 const byId=id=>document.getElementById(id);
 const launcher=byId('rox-launcher');
 const panel=byId('rox-panel');
 const field=byId('rox-message');
 const form=byId('rox-form');
 const sendButton=byId('rox-send');
 const log=byId('rox-log');
 const handoff=byId('rox-handoff');
 const quick=byId('rox-quick');
 const connection=byId('rox-connection');
 const state={messages:[],segment:'general',busy:false,open:false};
 const MAX_VISIBLE=26;
 const PII=/\b\d{3}\.\d{3}\.\d{3}[-.]?\d{2}\b|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\b(?:\d[ -]*?){13,19}\b|(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/i;
 const SEGMENT={atacado:'Atacado',varejo:'Varejo',geral:'Geral'};
 const on = (node,event,callback) => node.addEventListener(event,callback);

 function append(who,text){
  const bubble=document.createElement('div');
  bubble.className='rox-bubble '+who;
  bubble.textContent=String(text).slice(0,1100);
  log.appendChild(bubble);
  while(log.childElementCount>MAX_VISIBLE)log.firstElementChild.remove();
  log.scrollTop=log.scrollHeight;
 }
 function showHandoff(data){
  handoff.hidden=true;
  if(data.mode!=='handoff')return;
  const q=data.qualification||{},i=data.integrations||{},w=i.whatsapp||{};
  // Only show a draft when the backend explicitly proves nothing was sent.
  if(w.sent!==false||w.conversation_confirmed!==false||i.hubspot?.synced!==false||i.supabase?.row_written!==false)return;
  if(!['atacado','varejo','geral'].includes(q.segment))return;
  if(typeof w.message!=='string'||w.message.length>400)return;
  byId('rox-qualification').textContent='Perfil: '+SEGMENT[q.segment]+' • '+(q.stage==='needs_topic'?'Assunto pendente':'Pronto para atendimento humano');
  byId('rox-draft').textContent=w.message;
  handoff.hidden=false;
 }
 function reset(){
  state.messages=[];
  state.segment='general';
  state.busy=false;
  form.reset();
  log.replaceChildren();
  handoff.hidden=true;
  quick.hidden=false;
  append('assistant','Oi! Sou o ROX, assistente virtual da LANDER RIO. Posso conversar sobre treino, alimentação e nossa marca. Questões comerciais são direcionadas à equipe após confirmação.');
  field.focus({preventScroll:true});
 }
 function setOpen(open){
  panel.hidden=!open;
  state.open=open;
  launcher.setAttribute('aria-expanded',String(open));
  launcher.setAttribute('aria-label',open?'Fechar conversa com ROX':'Abrir conversa com ROX');
  if(open){
   if(log.childElementCount===0)reset();
   field.focus({preventScroll:true});
  }else launcher.focus({preventScroll:true});
 }
 function setBusy(busy){
  state.busy=busy;
  sendButton.disabled=busy;
  field.disabled=busy;
  log.setAttribute('aria-busy',String(busy));
 }
 async function postMessage(raw){
  const message=String(raw??'').trim().slice(0,600);
  if(!message||state.busy)return;
  field.value='';
  // Sensitive user text never leaves the browser, appears in the log or enters history.
  if(PII.test(message)){
   append('notice','Mensagem com dados pessoais omitida por segurança. Não envie telefone, CPF, cartão ou e-mail neste chat.');
   return;
  }
  const recent=state.messages.slice(-7);
  const request={messages:[...recent,{role:'user',content:message}],context:{segment:state.segment}};
  append('user',message);
  quick.hidden=true;
  handoff.hidden=true;
  setBusy(true);
  try{
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),10000);
   let res;
   try{
    res=await fetch('/api/rox/chat',{
     method:'POST',credentials:'omit',cache:'no-store',
     headers:{'content-type':'application/json'},
     body:JSON.stringify(request),signal:controller.signal
    });
   }finally{clearTimeout(timeout)}
   if(!res.ok)throw Error('HTTP '+res.status);
   const data=await res.json();
   if(!data||typeof data.reply!=='string'||!['offline','handoff','clinical','privacy','answer'].includes(data.mode))throw Error('invalid_reply');
   // No client-controlled HTML, no interpreted markup and no display of contact secrets.
   append('assistant',data.reply);
   showHandoff(data);
   if(data.qualification && ['atacado','varejo','geral'].includes(data.qualification.segment)){
    state.segment=data.qualification.segment==='atacado'?'b2b':data.qualification.segment==='varejo'?'b2c':'general';
   }
   if(data.mode==='privacy'||data.mode==='clinical'){
    state.messages=recent.slice(-6); // sensitive discussion is not carried forward
   }else{
    state.messages=[...recent,{role:'user',content:message},{role:'assistant',content:data.reply}].slice(-7);
   }
  }catch{
   append('notice','O motor de homologação não respondeu. Nenhuma mensagem foi enviada para a equipe. Tente novamente no ambiente local.');
  }finally{
   setBusy(false);
   field.focus({preventScroll:true});
  }
 }
 async function health(){
  try{
   const r=await fetch('/api/rox/health',{cache:'no-store',credentials:'omit'});
   const d=await r.json();
   if(!r.ok||d.ai_enabled!==false||d.environment!=='staging'||!String(d.agent_version||'').startsWith('3.')){
    throw Error('unsafe_backend');
   }
   connection.textContent='Motor ROX 3.0 conectado • respostas offline';
  }catch{
   connection.textContent='Motor local indisponível — confira a inicialização';
   sendButton.disabled=true;
  }
 }
 on(launcher,'click',()=>setOpen(!state.open));
 on(byId('hero-open'),'click',()=>setOpen(true));
 on(byId('rox-close'),'click',()=>setOpen(false));
 on(document,'keydown',e=>{if(e.key==='Escape'&&state.open)setOpen(false)});
 on(form,'submit',e=>{e.preventDefault();void postMessage(field.value)});
 on(field,'keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();void postMessage(field.value)}});
 on(quick,'click',e=>{const btn=e.target.closest('button[data-ask]');if(btn)void postMessage(btn.dataset.ask)});
 on(byId('rox-clear'),'click',reset);
 void health();
})();
