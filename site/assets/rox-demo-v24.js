/* LANDER RIO / ROX demonstration: offline, transparent, no external model, no storage.
   This is not the ROX 2.0 backend and does not confirm conversations or sales. */
(()=>{'use strict';
 const root=document.querySelector('[data-rox-root]');
 if(!root)return;
 const openButton=root.querySelector('[data-rox-launcher]');
 const panel=root.querySelector('[data-rox-panel]');
 const closeButton=root.querySelector('[data-rox-close]');
 const form=root.querySelector('[data-rox-form]');
 const input=root.querySelector('[data-rox-input]');
 const log=root.querySelector('[data-rox-log]');
 const quick=root.querySelector('[data-rox-quick]');
 const handoff=root.querySelector('[data-rox-handoff]');
 const phone='5521920043538';
 const MAX_TURNS=24;
 let turns=0;
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
 const matcher=(text,re)=>re.test(text);
 function classify(raw){
  const s=normalize(raw);
  if(!s)return 'empty';
  if(matcher(s,/(\b\d+\s*(mg|ui|ml)\b|\b(dose|doses|dosagem|posologia)\b|testosteron|insulin|somatrop|anabol|esteroid|esteroide|tirzepat|retatrut|clenbuterol|receita medica|automedic|hormon)/))return 'clinical';
  if(matcher(s,/(atendente|humano|pessoa real|equipe|whatsapp|falar com alguem|contato)/))return 'handoff';
  if(matcher(s,/(revend|atacado|distribui|pedido minimo|lojista)/))return 'wholesale';
  if(matcher(s,/(parcer|influencia|divulg|colaborac)/))return 'partnership';
  if(matcher(s,/(varejo|comprar para mim|cliente final|pessoa fisica)/))return 'retail';
  if(matcher(s,/(estoque|disponib|preco|valor|orcamento|entrega|frete|prazo|envio|pagamento)/) &&
     matcher(s,/(produto|pedido|marca|compr|atendimento|lander|atacado|varejo)/))return 'commercial';
  if(matcher(s,/(treino|ficha|exercicio|musculac|academia|treinar|periodizac)/))return 'training';
  if(matcher(s,/(dieta|aliment|caloria|proteina|macro|refeic|nutric)/))return 'nutrition';
  if(matcher(s,/(hipertrof|massa muscular|ganhar musculo|crescer musculo)/))return 'hypertrophy';
  if(matcher(s,/(sono|descans|recupera|fadiga)/))return 'recovery';
  if(matcher(s,/(enciclopedia|pesquisa|conteudo|cientif|artigo|estudo)/))return 'science';
  if(matcher(s,/(privacidade|dado pessoal|lgpd|rastre|consent)/))return 'privacy';
  if(matcher(s,/(quem e voce|seu nome|voce e ia|robo|como funciona|rox)/))return 'aboutrox';
  if(matcher(s,/(quem somos|quem e a lander|o que e lander|empresa|sobre a marca|lander rio)/))return 'about';
  if(matcher(s,/^(oi|ola|opa|e ai|bom dia|boa tarde|boa noite|hey|hello)[!?. ]*$/))return 'hello';
  if(matcher(s,/(obrigad|valeu|show|perfeito|beleza)/))return 'thanks';
  return 'other';
 }
 const responses={
  empty:'Me conte o que você quer saber: treino, alimentação, ciência, varejo, revenda ou parcerias.',
  hello:'Olá! Sou o ROX, o guia digital da LANDER RIO. Posso mostrar as ferramentas gratuitas, explicar os nossos conteúdos ou ajudar você a chegar à equipe. O que procura hoje?',
  about:'A LANDER RIO — PERFORMANCE CULTURE reúne conteúdo sobre musculação e performance, ferramentas educativas e caminhos de atendimento comercial. O site separa treino, alimentação, ciência, varejo e revenda.',
  aboutrox:'Eu sou o ROX nesta demonstração offline: respondo a assuntos frequentes e ajudo na navegação, sem usar IA em nuvem, consultar dados pessoais, acessar estoque ou enviar mensagens. A versão de IA com integração é um projeto separado, ainda não ativado aqui.',
  training:'O planejador de treino está em /treino/. Você informa seu perfil e a ferramenta organiza uma ficha educativa com exercícios, séries e descansos. Se houver dor, lesão ou condição clínica, procure avaliação profissional.',
  nutrition:'A ferramenta de alimentação fica em /dieta/. Ela estima calorias e organiza refeições, trocas e lista de compras, com limites de segurança. Não é prescrição clínica nem substitui nutricionista.',
  hypertrophy:'Para hipertrofia, o básico bem executado é progressão de treino, volume compatível com recuperação, alimentação suficiente e sono. Use a ferramenta de treino como ponto de organização, sem tratá-la como avaliação individual.',
  recovery:'Recuperação depende do conjunto: carga de treino, sono, alimentação e intervalos entre estímulos. Se houver dor persistente, fadiga importante ou sintomas, a orientação deve ser individualizada.',
  science:'Você encontra guias de treino e nutrição em /conteudos/ e referências de substâncias em /enciclopedia/. Conteúdo informativo não é recomendação de uso ou prescrição.',
  wholesale:'O atendimento para revendedores é separado do varejo. A equipe confirma se pode atender, quantidade, disponibilidade, condições e envio. Abra /atacado/ ou siga para o WhatsApp oficial.',
  retail:'Para atendimento individual, use /varejo/. Informe cidade e sua necessidade; a equipe confirma disponibilidade, condições aplicáveis e próximo passo antes da decisão.',
  partnership:'Para parcerias, o melhor caminho é apresentar seu perfil, cidade e proposta pelo canal de contato oficial. O ROX não aprova parcerias nem promete condições.',
  commercial:'Condições, preços, disponibilidade, pagamento e prazos precisam ser confirmados pela equipe. Posso abrir o WhatsApp com uma apresentação inicial; você decide se deseja enviar.',
  handoff:'Claro. O atendimento humano é feito pela equipe LANDER RIO no WhatsApp oficial. O ROX não envia mensagens automaticamente nem confirma que a equipe recebeu uma conversa.',
  clinical:'Posso apontar conteúdo educativo, mas não indico doses, protocolos, aquisição de medicamentos sujeitos a controle, nem substituo avaliação profissional. Para dúvidas clínicas, procure médico ou profissional habilitado.',
  privacy:'As mensagens desta demonstração ficam somente nesta janela enquanto ela estiver aberta; não são gravadas nem enviadas a um servidor pelo ROX. A política vigente está em /privacidade.',
  thanks:'Por nada. Quer explorar um conteúdo, abrir uma ferramenta ou falar com a equipe?',
  other:'Posso conversar sobre assuntos básicos ligados à LANDER RIO e indicar os caminhos certos. Não quero inventar uma resposta para algo fora do meu conteúdo offline. Quer me perguntar sobre treino, alimentação, ciência ou atendimento?'
 };
 function append(message,who='rox'){
  const el=document.createElement('div');
  el.className='lr-chat-message';
  el.dataset.who=who;
  el.textContent=message;
  log.appendChild(el);
  log.scrollTop=log.scrollHeight;
 }
 function showHandoff(category){
  if(!handoff)return;
  const subject={
   wholesale:'atendimento para revendedores',
   retail:'atendimento individual',
   partnership:'parcerias',
   commercial:'informações comerciais',
   handoff:'atendimento com a equipe'
  }[category]||'orientações gerais';
  const message='Olá! Vim pelo ROX no site da LANDER RIO. Gostaria de '+subject+'.';
  handoff.href='https://wa.me/'+phone+'?text='+encodeURIComponent(message);
  handoff.dataset.profile=category==='wholesale'?'atacado':category==='retail'?'varejo':'geral';
  handoff.hidden=false;
 }
 function respond(value){
  if(turns>=MAX_TURNS)return;
  const raw=String(value||'').trim().slice(0,240);
  if(!raw)return;
  append(raw,'user');
  const intent=classify(raw);
  append(responses[intent]||responses.other);
  turns++;
  if(['handoff','wholesale','retail','partnership','commercial'].includes(intent))showHandoff(intent);
  if(turns>=MAX_TURNS){
   input.disabled=true;
   form.querySelector('button[type=submit]').disabled=true;
   quick.querySelectorAll('button').forEach(button=>{button.disabled=true;button.setAttribute('aria-disabled','true')});
   append('Esta demonstração chegou ao limite de interações desta sessão. Recarregue a página para reiniciar ou siga para o atendimento oficial.');
  }
  log.scrollTop=log.scrollHeight;
 }
 // Floating assistant appears after the hero on mobile; the hero has a direct entry.
 const hero=document.querySelector('.flagship-hero');
 if(hero && typeof IntersectionObserver!=='undefined'){
  new IntersectionObserver(([entry])=>{
   root.dataset.pastHero=String(!entry.isIntersecting && entry.boundingClientRect.bottom<0);
  },{threshold:0}).observe(hero);
 }else root.dataset.pastHero='true';
 let returnFocus=openButton;
 function setOpen(value){
  if(value){
   const active=document.activeElement;
   if(active && typeof active.focus==='function')returnFocus=active;
  }
  root.dataset.open=String(value);
  panel.hidden=!value;
  openButton.setAttribute('aria-expanded',String(value));
  if(value)input.focus({preventScroll:true});
  else{
   const ask=document.querySelector('[data-rox-open]');
   const target=(returnFocus===openButton&&root.dataset.pastHero!=='true'&&ask)?ask:returnFocus;
   target.focus({preventScroll:true});
  }
 }
 openButton.addEventListener('click',()=>setOpen(panel.hidden));
 closeButton.addEventListener('click',()=>setOpen(false));
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();setOpen(false)}});
 form.addEventListener('submit',event=>{
  event.preventDefault();respond(input.value);input.value='';if(!input.disabled)input.focus();
 });
 quick.addEventListener('click',event=>{
  const button=event.target.closest('button[data-question]');
  if(!button)return;
  respond(button.dataset.question);
  if(!input.disabled)input.focus();
 });
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-rox-open]');
  if(button){event.preventDefault();setOpen(true)}
 });
 window.LanderRoxDemo={classify,isDemo:true};
})();
