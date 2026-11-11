import { CONFIG } from './config.js';
import { calculateTargets, adaptCalories } from './nutritionEngine.js';
import { generatePlan, planTotals } from './mealGenerator.js';
import { FOOD_MAP, nutrients, CATALOG_INFO, sourceLabel, validateFoodCatalog } from './foods.js';
import { getSwapCandidates, swapFood } from './substitutionEngine.js';
import { track, getUtm } from './analytics-v20.js';
import { save, load, clearAll } from './storage.js';

const profileFields=['goal','age','sex','height','weight','bodyFat','restrictions','steps','trainingsPerWeek','modality','trainingDuration','intensity','job','mealsPerDay','trainingTime','dietType','budget','cookTime','hunger','pregnant','renal','hepatic','diabetes','eatingDisorder','therapeuticDiet','severeAllergy'];
const rawProfile=load('profile',{}),safeProfile={};
if(rawProfile&&typeof rawProfile==='object'&&!Array.isArray(rawProfile))for(const key of profileFields){if(['string','number','boolean'].includes(typeof rawProfile[key]))safeProfile[key]=rawProfile[key];}
safeProfile.dislikes=Array.isArray(rawProfile?.dislikes)?rawProfile.dislikes.filter(id=>Object.hasOwn(FOOD_MAP,id)):[];
const rawCheckins=load('checkins',[]);
const state={step:0,profile:safeProfile,targets:null,plan:null,lead:load('lead'),checkins:Array.isArray(rawCheckins)?rawCheckins.filter(validCheckin).map(normalizeCheckin).slice(-104):[]};
const accessValid=lead=>lead?.access===true&&Number.isFinite(Date.parse(lead.created_at))&&Date.now()-Date.parse(lead.created_at)>=0&&Date.now()-Date.parse(lead.created_at)<31536000000;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validCheckin(c){return c&&typeof c==='object'&&Number.isFinite(Date.parse(c.date))&&Date.parse(c.date)<=Date.now()&&Object.entries({weight:[35,250],adherence:[0,100],hunger:[1,5],performance:[1,5],steps:[0,100000],trainings:[0,7]}).every(([k,[min,max]])=>c[k]!==''&&Number.isFinite(+c[k])&&+c[k]>=min&&+c[k]<=max)}
function normalizeCheckin(c){return Object.fromEntries(['date','weight','adherence','hunger','performance','steps','trainings'].map(k=>[k,k==='date'?new Date(c.date).toISOString():+c[k]]))}
function profileSignature(p){return JSON.stringify(profileFields.map(k=>[k,p[k]??null]).concat([['dislikes',[...(p.dislikes||[])].sort()]]))}
function restorePlan(){
  if(!accessValid(state.lead))return false;
  const target=calculateTargets(state.profile);if(target.errors?.length||target.blocked)return false;
  const p=load('plan');
  if(!p||p.profileSignature!==profileSignature(state.profile)||!Array.isArray(p.meals)||p.meals.length!==+state.profile.mealsPerDay||p.meals.some(m=>!m||typeof m.id!=='string'||!/^[a-z0-9_-]{1,40}$/i.test(m.id)||!['breakfast','snack','pre','post','lunch','dinner','ceia'].includes(m.slot)||typeof m.title!=='string'||typeof m.template!=='string'||!Array.isArray(m.items)||!m.items.length||m.items.some(i=>!i||!Object.hasOwn(FOOD_MAP,i.id)||typeof i.grams!=='number'||!Number.isFinite(i.grams)||i.grams<=0||i.grams>2000)))return false;
  state.plan={...p,meals:p.meals.map(m=>({...m,totals:m.items.reduce((a,i)=>{const n=nutrients(i.id,i.grams);for(const key of Object.keys(a))a[key]+=n[key];return a},{kcal:0,p:0,c:0,f:0,fiber:0})}))};
  state.plan.totals=planTotals(state.plan.meals);state.targets=target;return true;
}
const steps=['Objetivo','Corpo','Movimento','Rotina','Alimentação','Preferências','Segurança','Revisão'];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function focusHeading(root){const heading=root.querySelector('h1,h2,h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
function setView(id,focus=true){$$('[data-view]').forEach(v=>v.hidden=true);const view=$(`[data-view="${id}"]`);view.hidden=false;if(focus){focusHeading(view);view.scrollIntoView({behavior:'smooth',block:'start'})}}
function validateStep(index){
 const step=$$('[data-step]')[index];
 for(const el of step.querySelectorAll('input,select,textarea')){el.removeAttribute('aria-invalid');if(!el.checkValidity()){el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby','formError');showError('Revise '+(document.querySelector(`label[for="${el.id}"]`)?.textContent.toLowerCase()||'o campo indicado')+'. '+(el.min||el.max?`Faixa aceita: ${el.min} a ${el.max}.`:'Preencha uma opção válida.'));el.focus();return false}}
 return true;
}
function review(){const labels={loss:'Perder gordura',gain:'Ganhar massa',recomp:'Recomposição',maintain:'Manter peso',omnivore:'Onívoro',vegetarian:'Vegetariano',vegan:'Vegano'};const p=state.profile;$('#reviewSummary').innerHTML=[['Objetivo',labels[p.goal]||''],['Idade',`${p.age} anos`],['Altura e peso',`${p.height} cm · ${p.weight} kg`],['Treinos',`${p.trainingsPerWeek} por semana`],['Refeições',`${p.mealsPerDay} por dia`],['Padrão alimentar',labels[p.dietType]||'']].map(([k,v])=>`<div><dt>${k}</dt><dd>${escapeHTML(v)}</dd></div>`).join('')}

function val(name){const el=$(`[name="${name}"]`); return el?.type==='checkbox'?el.checked:el?.value;}
function selected(name){return $(`[name="${name}"]:checked`)?.value;}
function syncProfile(){
  const p=state.profile;
  const scalar=['age','sex','height','weight','bodyFat','restrictions','steps','trainingsPerWeek','modality','trainingDuration','intensity','job','mealsPerDay','trainingTime','dietType','budget','cookTime','hunger','goal'];
  scalar.forEach(n=>{const el=$(`[name="${n}"]`); if(el){ if(el.type==='radio'){const x=$(`[name="${n}"]:checked`); if(x)p[n]=x.value}else p[n]=el.value; }});
  ['pregnant','renal','hepatic','diabetes','eatingDisorder','therapeuticDiet','severeAllergy'].forEach(n=>{const el=$(`[name="${n}"]`); if(el)p[n]=el.checked});
  p.dislikes=($('[name="dislikes"]')?.value||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean).map(nameToFoodId).filter(Boolean);
  save('profile',p);
}
function nameToFoodId(x){ return Object.values(FOOD_MAP).find(f=>f.name.toLowerCase().includes(x))?.id || null; }

function renderStep(){
  $('#stepLabel').textContent=`${state.step+1} de ${steps.length} · ${steps[state.step]}`;
  $('#progressFill').style.width=`${((state.step+1)/steps.length)*100}%`;
  $$('[data-step]').forEach((el,i)=>el.hidden=i!==state.step);
  $('.progress').setAttribute('aria-valuenow',String(state.step+1));$('.progress').setAttribute('aria-valuetext',`${state.step+1} de 8: ${steps[state.step]}`);if(state.step===7)review();focusHeading($$('[data-step]')[state.step]);
  $('#prevBtn').hidden=state.step===0; $('#nextBtn').textContent=state.step===steps.length-1?'Calcular meu plano':'Continuar';
}

function hydrate(){
  const p=state.profile;
  Object.entries(p).filter(([k])=>profileFields.includes(k)).forEach(([k,v])=>{
    if(Array.isArray(v))return;
    const radios=$$(`[name="${k}"]`); if(radios.some(e=>e.type==='radio')) radios.forEach(e=>e.checked=e.value===String(v));
    else {const el=$(`[data-view="wizard"] [name="${k}"]`); if(el){ if(el.type==='checkbox')el.checked=v===true; else if(el.tagName!=='SELECT'||[...el.options].some(o=>o.value===String(v)))el.value=v??''; }}
  });
  $('[name="dislikes"]').value=(p.dislikes||[]).map(id=>FOOD_MAP[id]?.name).filter(Boolean).join(', ');
}

function demo(){
  state.profile={goal:'gain',age:'34',sex:'male',height:'186',weight:'85',bodyFat:'',steps:'7-10k',trainingsPerWeek:'5',modality:'weights',trainingDuration:'60',intensity:'moderate',job:'seated',mealsPerDay:'5',trainingTime:'morning',dietType:'omnivore',budget:'normal',cookTime:'medium',hunger:'medium',dislikes:[],restrictions:'',pregnant:false,renal:false,hepatic:false,diabetes:false,eatingDisorder:false,therapeuticDiet:false,severeAllergy:false};
  save('profile',state.profile); hydrate(); state.step=0; renderStep();
}

async function finishQuiz(){
  for(let i=0;i<steps.length;i++){if(!validateStep(i)){state.step=i;renderStep();validateStep(i);return;}}syncProfile(); const r=calculateTargets(state.profile);
  if(r.errors?.length){showError(r.errors.join(' ')); return;}
  if(r.blocked){renderReferral(r.safety); return;}
  state.targets=r;
  try { state.plan=generatePlan(state.profile,r); }
  catch (e) { showError(e?.message || 'Não foi possível montar um plano coerente com as restrições informadas.'); return; }
  state.plan.profileSignature=profileSignature(state.profile);save('targets',r); save('plan',state.plan);
  track('diet_generated',{objective:state.profile.goal,meals_per_day:state.profile.mealsPerDay,diet_type:state.profile.dietType,budget_tier:state.profile.budget,...getUtm()});
  $('#previewCalories').textContent=`≈ ${Math.round(r.calories/100)*100} kcal/dia`;
  if(accessValid(state.lead))renderResults();else setView('gate');
}

function showError(msg){$('#formError').textContent=msg; $('#formError').hidden=false;}
function clearError(){$('#formError').hidden=true;}
function renderReferral(s){
  $('#referralReasons').innerHTML=(s.reasons||[]).map(x=>`<li>${x}</li>`).join(''); setView('referral');
}

function fmt(n){return Math.round(n)}
function renderResults(){
  if(!state.plan||!state.targets)return;
  window.dispatchEvent(new Event('lander:utility-result'));
  const catalogAudit=validateFoodCatalog();
  const catalogEl=$('#catalogStatus');
  if(catalogEl) catalogEl.textContent=`Catálogo ${CATALOG_INFO.version} · ${CATALOG_INFO.foods} alimentos · ${CATALOG_INFO.directVerified} validados diretamente na TBCA · ${catalogAudit.ok?'integridade OK':'revisão necessária'}`;
  $('#calorieValue').textContent=state.targets.calories;
  $('#tdeeValue').textContent=state.targets.tdee;
  $('#methodValue').textContent=state.targets.method;
  $('#bmiValue').textContent=state.targets.bmi;
  $('#macroGrid').innerHTML=[['Proteína',state.targets.protein,'g'],['Carboidrato',state.targets.carbs,'g'],['Gordura',state.targets.fat,'g'],['Fibra',state.targets.fiber,'g']].map(([l,v,u])=>`<div class="metric"><span>${l}</span><strong>${v}${u}</strong></div>`).join('');
  $('#actualTotals').textContent=`Plano gerado: ${fmt(state.plan.totals.kcal)} kcal · P ${fmt(state.plan.totals.p)} g · C ${fmt(state.plan.totals.c)} g · G ${fmt(state.plan.totals.f)} g`;
  $('#mealList').innerHTML=state.plan.meals.map(m=>`<article class="meal-card"><div class="meal-head"><div><span class="eyebrow">${escapeHTML(m.template)}</span><h3>${escapeHTML(m.title)}</h3></div><div class="meal-kcal">${fmt(m.totals.kcal)} kcal</div></div>${m.items.map((it,idx)=>{const f=FOOD_MAP[it.id];return `<div class="food-row"><div><strong>${f.name}</strong><small>${f.state} · ${fmt(it.grams)} g · ${sourceLabel(f)}${f.requiresLabelConfirmation?' · confirmar rótulo':''}</small></div><div class="food-macros">P ${fmt(f.p*it.grams/100)} · C ${fmt(f.c*it.grams/100)} · G ${fmt(f.f*it.grams/100)}</div><button class="swap-btn" data-meal="${m.id}" data-index="${idx}" aria-label="Trocar ${escapeHTML(f.name)}">Trocar</button></div>`}).join('')}</article>`).join('');
  $$('.swap-btn').forEach(b=>b.onclick=()=>openSwap(b.dataset.meal,+b.dataset.index));
  renderShopping(); renderCheckins(); setView('results');
}
function openSwap(mealId,index){
  const meal=state.plan.meals.find(m=>m.id===mealId), item=meal?.items[index];if(!item)return;
  const cands=getSwapCandidates(item,meal,state.profile);
  $('#swapTitle').textContent=`Trocar ${FOOD_MAP[item.id].name}`;
  $('#swapOptions').innerHTML=cands.length?cands.map(c=>`<button class="swap-option" data-id="${c.food.id}"><span><strong>${c.food.name}</strong><small>${c.grams} g · ${c.food.state}</small></span><span>Selecionar</span></button>`).join(''):'<p>Não encontramos uma troca coerente para este contexto.</p>';
  $('#swapDialog').showModal();$('#closeSwap').focus();
  $$('#swapOptions .swap-option').forEach(b=>b.onclick=()=>{try{state.plan=swapFood(state.plan,mealId,index,b.dataset.id,state.profile);save('plan',state.plan);$('#swapDialog').close();renderResults();const button=$(`.swap-btn[data-meal="${mealId}"][data-index="${index}"]`);button?.focus();button?.scrollIntoView({block:'center'});}catch{let error=$('#swapError');if(!error){error=document.createElement('p');error.id='swapError';error.className='error';error.setAttribute('role','alert');$('#swapOptions').append(error)}error.textContent='Esta troca não é compatível. Escolha outro alimento.'}});
}
function renderShopping(){
  const categories={Proteínas:[],Carboidratos:[],Frutas:[],Vegetais:[],Laticínios:[],Outros:[]};
  const sums={}; state.plan.meals.forEach(m=>m.items.forEach(it=>sums[it.id]=(sums[it.id]||0)+it.grams*7));
  Object.entries(sums).forEach(([id,g])=>{const f=FOOD_MAP[id]; let cat='Outros'; if(f.role==='protein'||f.role==='legume')cat='Proteínas'; if(f.role==='carb')cat='Carboidratos'; if(f.role==='fruit')cat='Frutas'; if(f.role==='veg')cat='Vegetais'; if(f.role==='dairy')cat='Laticínios'; categories[cat].push(`${f.name}: ${roundShopping(g)}`)});
  $('#shopping').innerHTML=Object.entries(categories).filter(([,v])=>v.length).map(([k,v])=>`<div class="shop-group"><h3>${k}</h3>${v.map(x=>`<div>${x}</div>`).join('')}</div>`).join('');
}
function roundShopping(g){ if(g>=1000)return `${(Math.round(g/100)/10).toFixed(1)} kg`; return `${Math.ceil(g/50)*50} g`; }
function renderCheckins(){
  const ordered=[...state.checkins].filter(c=>Number.isFinite(+c.weight)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const last=ordered.slice(-4).reverse();
  $('#checkinHistory').innerHTML=last.length?last.map(c=>`<div class="history-row"><span>${new Date(c.date).toLocaleDateString('pt-BR')}</span><strong>${c.weight} kg</strong><span>${c.adherence}% aderência</span></div>`).join(''):'<p class="muted">Nenhum check-in ainda.</p>';
  $('#checkinStat').textContent=ordered.length?`${ordered.length} check-in${ordered.length>1?'s':''} registrado${ordered.length>1?'s':''}`:'Comece seu histórico semanal';
  if(ordered.length<2){ $('#trendChart').innerHTML='<p class="muted">O gráfico aparece após o segundo check-in.</p>'; return; }
  const pts=ordered.slice(-8), weights=pts.map(x=>+x.weight), min=Math.min(...weights), max=Math.max(...weights), span=Math.max(1,max-min);
  const coords=pts.map((x,i)=>`${10+i*(300/Math.max(1,pts.length-1))},${85-((+x.weight-min)/span)*65}`).join(' ');
  $('#trendChart').innerHTML=`<svg viewBox="0 0 320 100" role="img" aria-label="Tendência de peso"><line x1="10" y1="85" x2="310" y2="85" class="chart-axis"/><polyline points="${coords}" class="chart-line"/>${coords.split(' ').map(pt=>{const [x,y]=pt.split(',');return `<circle cx="${x}" cy="${y}" r="3.5" class="chart-dot"/>`}).join('')}</svg><div class="chart-labels"><span>${min.toFixed(1)} kg</span><span>${max.toFixed(1)} kg</span></div>`;
}

async function postPrimaryLead(payload){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),12000);
  try{
    const res=await fetch(CONFIG.LEAD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal,keepalive:true});
    if(!res.ok) throw new Error(`lead endpoint ${res.status}`);
    const result=await res.json();
    if(result.ok!==true || typeof result.id!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.id)) throw new Error('lead not confirmed');
    return true;
  }finally{ clearTimeout(timer); }
}
async function deliverLead(payload){ await postPrimaryLead(payload); return 'primary'; }
async function submitLead(e){
  e.preventDefault();
  const form=e.currentTarget, fd=new FormData(form);
  const name=String(fd.get('name')||'').trim();
  const whatsapp=String(fd.get('whatsapp')||'').trim();
  const email=String(fd.get('email')||'').trim().toLowerCase();
  const consentAccess=fd.has('consent_access');
  const consentMarketing=fd.has('consent_marketing');
  const company=String(fd.get('company')||'').trim();
  const error=$('#gateError'), submit=form.querySelector('button[type="submit"]');
  if(submit.disabled)return;
  error.hidden=true; error.textContent='';form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));const gateError=(message,name)=>{error.textContent=message;error.hidden=false;const el=form.elements[name];if(el){el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby','gateError');el.focus()}};
  if(name.length<2||name.length>100){gateError('Informe seu nome (2 a 100 caracteres).','name');return;}
  if(!/^(?:55)?[1-9][0-9](?:[2-9][0-9]{7}|9[0-9]{8})$/.test(whatsapp.replace(/\D/g,''))){gateError('Informe um WhatsApp válido com DDD.','whatsapp');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>160){gateError('Informe um e-mail válido.','email');return;}
  if(!consentAccess){gateError('Confirme a Política de Privacidade para liberar seu plano.','consent_access');return;}
  // Honeypot: bots não recebem fluxo de lead; o usuário real segue normalmente.
  if(company){error.textContent='Não foi possível validar o formulário.';error.hidden=false;return;}

  const utm=getUtm();
  const payload={
    name,whatsapp,email,
    consent_access:consentAccess,
    consent_marketing:consentMarketing,
    source_page:location.pathname,
    created_at:new Date().toISOString(),
    ...utm
  };

  submit.disabled=true; submit.textContent='Confirmando cadastro…';
  try {
    await deliverLead(payload);
    state.lead={access:true,contact_consent:consentMarketing,created_at:payload.created_at};
    save('lead',state.lead);
    window.LanderAccess?.confirmed('nutrition',true);
    renderResults();
  } catch {
    error.textContent='Não foi possível confirmar o cadastro. Seus dados continuam preenchidos. Verifique a conexão e tente novamente.';
    error.hidden=false;
  } finally {
    submit.disabled=false; submit.textContent='Liberar meu plano';
  }
}

function submitCheckin(e){
  e.preventDefault(); const fd=new FormData(e.currentTarget); const c=Object.fromEntries(fd.entries()); c.date=new Date().toISOString(); c.weight=+c.weight;c.adherence=+c.adherence;c.hunger=+c.hunger;c.performance=+c.performance;c.steps=+c.steps;c.trainings=+c.trainings;
  if(!e.currentTarget.reportValidity()||!validCheckin(c)){$('#checkinError').textContent='Revise os valores do check-in antes de registrar.';$('#checkinError').hidden=false;return;}$('#checkinError').hidden=true;state.checkins.push(normalizeCheckin(c));state.checkins=state.checkins.slice(-104); save('checkins',state.checkins);
  const adj=adaptCalories({currentCalories:state.targets.calories,goal:state.profile.goal,checkins:state.checkins});
  $('#adjustment').innerHTML=`<strong>${adj.change===0?'Sem mudança':`${adj.change>0?'+':''}${adj.change} kcal`}</strong><p>${adj.reason}</p>`;
  track('diet_checkin_submitted',{objective:state.profile.goal}); renderCheckins(); e.currentTarget.reset();
}
function setup(){
  $('#startBtn').onclick=()=>{window.dispatchEvent(new Event('lander:utility-started'));track('diet_started',{...getUtm()});setView('wizard');renderStep()};
  $('#demoBtn').onclick=()=>{window.dispatchEvent(new Event('lander:utility-started'));demo();setView('wizard')};
  $('#prevBtn').onclick=()=>{clearError();syncProfile();state.step=Math.max(0,state.step-1);renderStep()};
  $('#nextBtn').onclick=()=>{clearError();if(!validateStep(state.step))return;syncProfile();track('diet_step_completed',{step:state.step+1,objective:state.profile.goal||''});if(state.step===steps.length-1)finishQuiz();else{state.step++;renderStep()}};
  $('#gateBackBtn').onclick=()=>{state.step=7;setView('wizard');renderStep()};$('#editProfileBtn').onclick=()=>{state.step=0;setView('wizard');renderStep()};
  $('#leadForm').onsubmit=submitLead; $('#checkinForm').onsubmit=submitCheckin;
  $('#shoppingBtn').onclick=()=>{track('diet_shopping_list_viewed',{objective:state.profile.goal});$('#shoppingPanel').scrollIntoView({behavior:'smooth'})};
  $('#downloadBtn').onclick=()=>{track('diet_downloaded',{objective:state.profile.goal});window.print()};
  $('#eraseBtn').onclick=()=>{if(confirm('Apagar os dados deste app salvos neste aparelho?')){clearAll();location.href='/dieta/'}};
  $('#closeSwap').onclick=()=>$('#swapDialog').close();
  $('#backHome').onclick=()=>setView('landing'); $('#referralHome').onclick=()=>setView('landing');
  $('#whatsappBtn').onclick=e=>{track('diet_whatsapp_clicked',{objective:state.profile.goal});if(CONFIG.WHATSAPP_NUMBER){e.currentTarget.href=`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Preciso de ajuda com o acesso a uma ferramenta gratuita da LANDER RIO.')}`}else{e.preventDefault();alert('Defina WHATSAPP_NUMBER em config.js antes do deploy.')}};
  hydrate();
  try{if(restorePlan()){renderResults();}else setView('landing',false)}catch{state.plan=null;state.targets=null;setView('landing',false)}
}
setup();
