window.LR_PUBLIC_ANALYTICS_TOKEN='phc_w67bCNxbz4BhPM23ZKmkHQbxzCYL5kiqTUTbhX2Eq3Du';
/* Minimal, consent-based event transport. No autocapture, session replay or advertising. */
(()=>{'use strict';
const KEY='lr_measurement_consent_v20',SID='lr_measurement_session_v20',ATTR='lr_attribution_v20';
const allowed=new Set(['site_visit','cta_interaction','profile_selected','whatsapp_open_click','utility_started','utility_result_displayed','utility_registration_confirmed','guide_share','rox_opened','rox_response','hero_view','wholesale_selected','retail_selected','brand_interaction']);
const pages={'/':'home','/atacado/':'wholesale','/varejo/':'retail','/contato/':'contact','/business-desk/':'business','/entregas/':'delivery','/perguntas-frequentes/':'faq','/sobre/':'about'};
Object.assign(pages,{'/ferramentas/':'tools','/treino/':'training','/dieta/':'nutrition','/conteudos/':'content'});
const path=location.pathname,guideId=document.body.dataset.guide;const page=pages[path]||(/^seo-[0-9]{2}$/.test(guideId||'')?'guide':null),sensitive=!page,toolPage=['training','nutrition'].includes(page);let milestones=new Set();let consent=null,session=null,visited=false,events=[],preferenceTrigger=null;
const get=(store,k)=>{try{return window[store].getItem(k)}catch{return null}};const set=(store,k,v)=>{try{window[store].setItem(k,v)}catch{}};const remove=(store,k)=>{try{window[store].removeItem(k)}catch{}};
const validConsent=value=>['granted','denied'].includes(value)?value:null;
consent=validConsent(get('localStorage',KEY));
function identity(){if(!session){session=get('sessionStorage',SID);if(!session){session=crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);set('sessionStorage',SID,session);}}return session;}
function attribution(){
 if(get('localStorage',KEY)!=='granted'){remove('sessionStorage',ATTR);return {}}
 const q=new URLSearchParams(location.search),fields=['source','medium','campaign','content'];let raw={};
 // A new explicit campaign replaces the complete set, preventing mixed attribution.
 if(fields.some(field=>q.has('utm_'+field)))fields.forEach(field=>{raw[field]=q.get('utm_'+field)});
 else{try{raw=JSON.parse(get('sessionStorage',ATTR)||'{}')}catch{}}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))raw={};const a={};
 raw={...raw};if(raw.source==='ig')raw.source='instagram';if(raw.source==='fb')raw.source='facebook';if(raw.content==='link_in_bio')raw.content='bio';
 if(['instagram','whatsapp','google','facebook','tiktok','direct'].includes(raw.source))a.source=raw.source;
 if(['social','organic','cpc','referral','bio','story','reel','paid_social','organic_social'].includes(raw.medium))a.medium=raw.medium;
 if(typeof raw.campaign==='string'&&/^lr-\d{6,12}$/.test(raw.campaign))a.campaign=raw.campaign;
 if(typeof raw.content==='string'&&(/^(bio|story|reel)$/.test(raw.content)||/^(r|c|s|seo|ad)-[0-9]{2}(?:-[ab])?$/.test(raw.content)))a.content=raw.content;
 set('sessionStorage',ATTR,JSON.stringify(a));return a;
}
function push(event,p={}){if(consent!=='granted'||sensitive||!allowed.has(event))return false;
 const data={page,release:'digital-flagship-2026-rc3',...attribution()};if(['geral','atacado','varejo','suporte'].includes(p.profile))data.profile=p.profile;
 if(['hero','header','profile-card','optional-context','closing','mobile-sticky','fallback','content','rox','brand-directory'].includes(p.placement))data.placement=p.placement;
 if(['whatsapp','choose-profile','subject_changed','tool-training','tool-nutrition','tools-nav','tools-hero'].includes(p.action))data.action=p.action;
 if(['offline','unknown','handoff','privacy','clinical'].includes(p.mode))data.rox_mode=p.mode;
 if(!toolPage)data.contact_reference=getContactReference();if(page==='guide')data.guide=guideId;const payload={api_key:window.LR_PUBLIC_ANALYTICS_TOKEN,event,properties:{distinct_id:identity(),...data,$process_person_profile:false,$geoip_disable:true,$ip:null}};
 events.push({event,...data});if(events.length>100)events.shift();window.dispatchEvent(new CustomEvent('lander:measurement',{detail:{event,...data}}));
 if(location.hostname==='landerrio.com.br'&&payload.api_key){try{fetch('https://us.i.posthog.com/i/v0/e/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true}).catch(()=>{});}catch{}}
 return true;}
function getContactReference(){if(consent!=='granted'||sensitive||toolPage)return null;return 'LR-'+identity().replace(/[^a-z0-9]/gi,'').slice(0,12).toUpperCase();}
function visit(){if(!visited&&consent==='granted'&&!sensitive){visited=true;push('site_visit')}}
function applyConsent(value){consent=validConsent(value);document.querySelector('#lr-privacy')?.remove();if(consent!=='granted'){session=null;events=[];visited=false;milestones.clear();remove('sessionStorage',SID);remove('sessionStorage',ATTR);}else visit();window.dispatchEvent(new CustomEvent('lander:consent',{detail:{consent}}));}
function choose(value){const focusedInBanner=document.querySelector('#lr-privacy')?.contains(document.activeElement);set('localStorage',KEY,value);applyConsent(value);if(focusedInBanner){const target=preferenceTrigger?.isConnected?preferenceTrigger:document.querySelector('[data-privacy-open]');target?.focus({preventScroll:true});}preferenceTrigger=null;}
window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){applyConsent(get('localStorage',KEY));if(!consent&&!sensitive)show();}});
function show(){if(document.querySelector('#lr-privacy'))return;const box=document.createElement('aside');box.id='lr-privacy';box.className='privacy-bar';box.setAttribute('aria-label','Preferências de privacidade');box.innerHTML='<div class="wrap privacy-inner"><p><strong>Você escolhe a medição.</strong> Podemos medir visitas e cliques para melhorar o site? Não enviamos os dados dos formulários ao analytics. <a href="/privacidade">Saiba mais</a>.</p><div class="privacy-actions"><button type="button" data-choice="denied">Somente necessário</button><button type="button" data-choice="granted">Permitir medição</button></div></div>';
 const footer=document.querySelector('footer');(footer||document.body).insertAdjacentElement(footer?'beforebegin':'beforeend',box);box.addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(b)choose(b.dataset.choice)});}
window.LanderMeasurement={push,getContactReference,getAttribution:()=>({...attribution()}),getSnapshot:()=>events.map(e=>({...e})),getConsent:()=>consent,showPreferences:show};
document.addEventListener('click',e=>{const a=e.target.closest('[data-privacy-open]');if(a){e.preventDefault();preferenceTrigger=a;show();document.querySelector('#lr-privacy').scrollIntoView({behavior:'smooth',block:'center'});document.querySelector('#lr-privacy button').focus({preventScroll:true});}});
function milestone(event){if(!toolPage||milestones.has(event))return;if(push(event))milestones.add(event);}
window.addEventListener('lander:utility-started',()=>milestone('utility_started'));
window.addEventListener('lander:utility-result',()=>milestone('utility_result_displayed'));
window.addEventListener('lander:registration-confirmed',event=>{if(event.detail?.backend_confirmed===true)milestone('utility_registration_confirmed')});
if(!consent&&!sensitive)show();visit();
})();
