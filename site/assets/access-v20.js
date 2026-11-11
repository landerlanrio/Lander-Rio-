/* Operational access registration is separate from commercial qualification. */
(()=>{'use strict';
const CONSENT='lr_measurement_consent_v20',ATTR='lr_attribution_v20';
const fields=['source','medium','campaign','content'];
function consentGranted(){try{return window.localStorage.getItem(CONSENT)==='granted'}catch{return false}}
function clearAttribution(){try{window.sessionStorage.removeItem(ATTR)}catch{}}
function sanitizeAttribution(raw){
 const a={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return a;
 raw={...raw};if(raw.source==='ig')raw.source='instagram';if(raw.source==='fb')raw.source='facebook';if(raw.content==='link_in_bio')raw.content='bio';
 if(['instagram','whatsapp','google','facebook','tiktok','direct'].includes(raw.source))a.source=raw.source;
 if(['social','organic','cpc','referral','bio','story','reel','paid_social','organic_social'].includes(raw.medium))a.medium=raw.medium;
 if(typeof raw.campaign==='string'&&/^lr-\d{6,12}$/.test(raw.campaign))a.campaign=raw.campaign;
 if(typeof raw.content==='string'&&(/^(bio|story|reel)$/.test(raw.content)||/^(r|c|s|seo|ad)-[0-9]{2}(?:-[ab])?$/.test(raw.content)))a.content=raw.content;
 return a;
}
function getAttribution(){
 const q=new URLSearchParams(location.search),granted=consentGranted();
 // Explicit campaign parameters form one set; never fill gaps from an older campaign.
 const explicit=fields.some(field=>q.has('utm_'+field));let raw={};
 if(!granted)clearAttribution();
 if(explicit)fields.forEach(field=>{raw[field]=q.get('utm_'+field)});
 else if(granted){try{raw=JSON.parse(window.sessionStorage.getItem(ATTR)||'{}')}catch{}}
 const a=sanitizeAttribution(raw);
 // Direct URL context remains available for registration; persistence is opt-in only.
 if(explicit&&granted){try{window.sessionStorage.setItem(ATTR,JSON.stringify(a))}catch{}}
 return Object.fromEntries(Object.entries(a).map(([field,value])=>['utm_'+field,value]));
}
// Clear this tab's attribution when consent is revoked from another tab.
window.addEventListener('storage',event=>{if((event.key===CONSENT||event.key===null)&&!consentGranted())clearAttribution()});
if(!consentGranted())clearAttribution();
window.LanderAccess={getAttribution,confirmed:(tool,backendConfirmed)=>{if(backendConfirmed===true&&['training','nutrition'].includes(tool))window.dispatchEvent(new CustomEvent('lander:registration-confirmed',{detail:{registration_type:'tool_access',backend_confirmed:true}}));}};
})();
