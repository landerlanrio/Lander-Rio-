'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(pathname='/', consent='granted', search='') {
  const memory = (initial={}) => {
    const values = new Map(Object.entries(initial));
    return { getItem:k=>values.get(k)??null, setItem:(k,v)=>values.set(k,v), removeItem:k=>values.delete(k) };
  };
  const listeners = new Map(), requests=[], scriptLoads=[];
  const window = {localStorage:memory({lr_measurement_consent_v20:consent}), sessionStorage:memory(),
    addEventListener(n,f){const a=listeners.get(n)||[];a.push(f);listeners.set(n,a);},
    dispatchEvent(e){for(const f of listeners.get(e.type)||[]) f(e);}};
  const document={body:{dataset:{}},head:{appendChild:s=>scriptLoads.push(s)},createElement:()=>({}),querySelector:()=>null,addEventListener(){}};
  const ctx=vm.createContext({window,document,location:{hostname:'landerrio.com.br',pathname,search}, URLSearchParams,
    crypto:{randomUUID:()=> 'synthetic-session'}, CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}},
    fetch:async (url,options)=>{requests.push({url,body:JSON.parse(options.body)});return {ok:true};}});
  for(const f of ['measurement-v23-2.js','ga4-config.js','ga4-intent.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..','site','assets',f),'utf8'),ctx,{filename:f});
  const events=(name)=>(window.dataLayer||[]).filter(a=>a[0]==='event'&&a[1]===name);
  const event=(type,detail={})=>window.dispatchEvent({type,detail});
  return {window,api:window.LanderMeasurement,events,event,requests,scriptLoads};
}

test('cadastro sem confirmação explícita não entra no GA4/PostHog',()=>{
  const p=setup('/treino/');
  assert.equal(p.api.push('utility_registration_confirmed'),false);
  assert.equal(p.events('generate_lead').length,0);
  assert.equal(p.requests.filter(x=>x.body.event==='utility_registration_confirmed').length,0);
});
test('cadastro com confirmação falsa não entra no GA4',()=>{
  const p=setup('/dieta/');
  assert.equal(p.api.push('utility_registration_confirmed',{backend_confirmed:false}),false);
  assert.equal(p.events('generate_lead').length,0);
});
test('cadastro técnico não é aceito fora das ferramentas, mesmo com flag',()=>{
  const p=setup('/');
  assert.equal(p.api.push('utility_registration_confirmed',{backend_confirmed:true}),false);
  assert.equal(p.events('generate_lead').length,0);
});
test('evento válido de cadastro nas ferramentas continua funcionando uma vez',()=>{
  const p=setup('/treino/');
  p.event('lander:registration-confirmed',{backend_confirmed:true});
  p.event('lander:registration-confirmed',{backend_confirmed:true});
  assert.equal(p.events('generate_lead').length,1);
  assert.equal(p.events('generate_lead')[0][2].lead_type,'utility_registration');
  assert.equal(p.requests.filter(x=>x.body.event==='utility_registration_confirmed').length,1);
});
test('evento de cadastro sem confirmação não é aceito',()=>{
  const p=setup('/dieta/');p.event('lander:registration-confirmed',{});p.event('lander:registration-confirmed',{backend_confirmed:false});
  assert.equal(p.events('generate_lead').length,0);
});
test('clique WhatsApp não vira generate_lead',()=>{
  const p=setup('/');assert.equal(p.api.push('whatsapp_open_click',{action:'whatsapp'}),true);
  assert.equal(p.events('whatsapp_open_click').length,1);assert.equal(p.events('generate_lead').length,0);
});
test('recibo comercial sem flag não emite evento; com flag permanece separado',()=>{
  const p=setup('/atacado/');assert.equal(p.api.push('commercial_request_saved'),false);
  assert.equal(p.api.push('commercial_request_saved',{backend_confirmed:true}),true);
  assert.equal(p.events('commercial_request_saved').length,1);assert.equal(p.events('generate_lead').length,0);
});
test('sem consentimento não dispara rede nem GA4',()=>{
  const p=setup('/treino/','denied');p.event('lander:registration-confirmed',{backend_confirmed:true});
  assert.equal(p.requests.length,0);assert.equal(p.scriptLoads.length,0);assert.equal(p.events('generate_lead').length,0);
});
test('exclusões sensíveis e páginas de marcas são preservadas',()=>{
  for(const route of ['/marcas/','/marcas/indufar/','/enciclopedia/substancias/tirzepatida/']){const p=setup(route);assert.equal(p.api.isEnabled(),false);assert.equal(p.requests.length,0);assert.equal(p.scriptLoads.length,0);}
});
test('atribuição autorizada permanece e URL omite consulta',()=>{
  const p=setup('/','granted','?utm_source=ig&utm_medium=social&utm_campaign=lr-261126&private=synthetic-secret');
  const config=p.window.dataLayer.find(a=>a[0]==='config')[2];
  assert.equal(config.campaign_source,'instagram');assert.equal(config.campaign_medium,'social');assert.equal(config.page_location,'https://landerrio.com.br/');assert.equal(config.page_referrer,'');
  assert.doesNotMatch(JSON.stringify(p.window.dataLayer),/synthetic-secret/);
  assert.equal(p.events('page_view').length,1);
});
test('revogação de consentimento interrompe envio e não reenvia cadastro',()=>{
  const p=setup('/treino/');p.event('lander:registration-confirmed',{backend_confirmed:true});
  p.window.localStorage.setItem('lr_measurement_consent_v20','denied');p.window.dispatchEvent({type:'storage',key:'lr_measurement_consent_v20'});
  p.event('lander:registration-confirmed',{backend_confirmed:true});assert.equal(p.events('generate_lead').length,1);
});
test('download público permanece distinto de conversão',()=>{
  const p=setup('/');p.api.push('cta_interaction',{action:'download-diario-de-treino-csv'});
  assert.equal(p.events('cta_interaction')[0][2].action,'download-diario-de-treino-csv');assert.equal(p.events('generate_lead').length,0);
});

test('a API pública não duplica o cadastro já emitido pelo listener',()=>{
  const p=setup('/treino/');p.event('lander:registration-confirmed',{backend_confirmed:true});
  assert.equal(p.api.push('utility_registration_confirmed',{backend_confirmed:true}),false);
  assert.equal(p.events('generate_lead').length,1);
});
test('revogação e novo consentimento não reproduzem cadastro antigo no mesmo documento',()=>{
  const p=setup('/treino/');p.event('lander:registration-confirmed',{backend_confirmed:true});
  p.window.localStorage.setItem('lr_measurement_consent_v20','denied');p.window.dispatchEvent({type:'storage',key:'lr_measurement_consent_v20'});
  p.window.localStorage.setItem('lr_measurement_consent_v20','granted');p.window.dispatchEvent({type:'storage',key:'lr_measurement_consent_v20'});
  p.event('lander:registration-confirmed',{backend_confirmed:true});
  assert.equal(p.events('generate_lead').length,1);
});
test('cadastro direto validado e listener compartilham deduplicação',()=>{
  const p=setup('/dieta/');assert.equal(p.api.push('utility_registration_confirmed',{backend_confirmed:true}),true);
  p.event('lander:registration-confirmed',{backend_confirmed:true});
  assert.equal(p.events('generate_lead').length,1);
});
