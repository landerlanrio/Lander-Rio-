/* Bridge for RC9's existing consent and validated measurement events. No new click listener. */
(()=>{'use strict';
 if(window.LanderGA4)return;
 const config=window.LanderGA4Config||{}, id='G-C3HWDYKEJK';
 let initialized=false,granted=false,pageSent=false;const seen=new WeakSet();
 const names=new Set(['cta_interaction','profile_selected','whatsapp_open_click','utility_started','utility_result_displayed','utility_registration_confirmed','commercial_request_saved','guide_share','rox_opened','hero_view','wholesale_selected','retail_selected']);
 const pages=new Set(['home','wholesale','retail','contact','business','delivery','faq','about','tools','training','nutrition','content','guide']);
 const values={profile:['geral','atacado','varejo','suporte'],placement:['hero','header','profile-card','optional-context','closing','mobile-sticky','fallback','content','rox','brand-directory'],action:['whatsapp','choose-profile','subject_changed','tool-training','tool-nutrition','tools-nav','tools-hero','download-diario-de-treino-csv','download-lista-de-compras-semanal-csv']};
 function permitted(){return config.enabled===true&&config.enhancedMeasurementReviewed===true&&location.hostname==='landerrio.com.br'&&window.LanderMeasurement?.isEnabled()===true;}
 function tag(){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};window.gtag.apply(window,arguments);}
 function cleanLocation(){return 'https://landerrio.com.br'+location.pathname;}
 function landingCampaign(){
  // Use the existing measurement allowlist. Only explicit source/medium pairs can override GA4.
  const query=new URLSearchParams(location.search);
  if(!query.has('utm_source')||!query.has('utm_medium'))return {};
  const attribution=window.LanderMeasurement.getAttribution?.();
  if(!attribution?.source||!attribution.medium)return {};
  const fields={campaign_source:attribution.source,campaign_medium:attribution.medium};
  if(attribution.campaign)fields.campaign_name=attribution.campaign;
  if(attribution.content)fields.campaign_content=attribution.content;
  return fields;
 }
 function start(){
  if(!permitted())return false;
  if(!initialized){
   // Fail closed if another Google implementation owns this page: resolve ownership before activation.
   if(window.gtag||document.querySelector('script[src*="googletagmanager.com"]'))return false;
   initialized=true;window['ga-disable-'+id]=false;
   tag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   tag('js',new Date());
   tag('config',id,{...landingCampaign(),send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:cleanLocation(),page_referrer:'',page_title:'LANDER RIO'});
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;script.referrerPolicy='no-referrer';document.head.appendChild(script);
  }
  if(!granted){window['ga-disable-'+id]=false;tag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});granted=true;}
  return true;
 }
 function send(data){
  if(!data||typeof data!=='object'||seen.has(data)||!pages.has(data.page)||(!names.has(data.event)&&data.event!=='site_visit')||!start())return false;
  seen.add(data);
  let event=data.event;if(event==='site_visit'){if(pageSent)return false;pageSent=true;event='page_view';}
  // This upstream event requires backend_confirmed=true in measurement-v23-2.js.
  if(event==='utility_registration_confirmed')event='generate_lead';
  const params={send_to:id,page_location:cleanLocation(),page_referrer:'',page_title:'LANDER RIO',page_type:data.page,measurement_version:'intent-0.3.0'};
  for(const [key,options]of Object.entries(values))if(options.includes(data[key]))params[key]=data[key];
  if(event==='generate_lead')params.lead_type='utility_registration';
  if(config.debug===true)params.debug_mode=true;
  tag('event',event,params);return true;
 }
 function consent(){
  if(!permitted()){
   if(initialized){window['ga-disable-'+id]=true;tag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});}
   granted=false;return;
  }
  // Never replay historical conversions on reconsent. One page view per document only.
  start();if(!pageSent)send({event:'site_visit',page:window.LanderMeasurement.getSnapshot().find(x=>x.event==='site_visit')?.page});
 }
 window.addEventListener('lander:measurement',e=>send(e.detail));
 window.addEventListener('lander:consent',consent);
 window.LanderGA4=Object.freeze({getStatus:()=>({enabled:permitted(),initialized,consent:granted?'granted':'denied',measurementId:id})});
 // Loading after the existing measurement script recovers its initial visit, never prior conversions.
 consent();
})();
