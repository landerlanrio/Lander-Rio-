const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const code=fs.readFileSync(require('node:path').join(__dirname,'../site/assets/measurement-v23-2.js'),'utf8');
function harness(consent='granted',hostname='localhost',pathname='/'){
 const local=new Map([['lr_measurement_consent_v20',consent]]),session=new Map(),handlers={},sent=[];
 const storage=m=>({getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)});
 const window={localStorage:storage(local),sessionStorage:storage(session),addEventListener:(n,fn)=>handlers[n]=fn,dispatchEvent:()=>{}};
 const document={body:{dataset:{}},querySelector:()=>null,addEventListener:()=>{}};
 vm.runInNewContext(code,{window,document,location:{hostname,pathname,search:''},URLSearchParams,crypto:{randomUUID:()=> '12345678-abcd-1234-1234-123456789012'},CustomEvent:class{constructor(name,options){this.type=name;this.detail=options.detail}},fetch:(...a)=>{sent.push(a);return Promise.resolve()},Set,Date,Math});
 return {api:window.LanderMeasurement,sent,revoke:()=>{local.set('lr_measurement_consent_v20','denied');handlers.storage({key:'lr_measurement_consent_v20'})}};
}
test('denied consent blocks all new events and network writes',()=>{const h=harness('denied','landerrio.com.br');for(const e of ['hero_view','wholesale_selected','retail_selected','brand_interaction'])assert.equal(h.api.push(e),false);assert.equal(h.api.getSnapshot().length,0);assert.equal(h.sent.length,0)});
test('preview logs allowed interactions locally without contacting PostHog',()=>{const h=harness();for(const e of ['hero_view','wholesale_selected','retail_selected','brand_interaction'])assert.equal(h.api.push(e,{placement:'hero'}),true);assert.equal(h.api.getSnapshot().length,5);assert.equal(h.sent.length,0)});
test('event payload drops free text, email, brand and arbitrary values',()=>{const h=harness('granted','landerrio.com.br');h.api.push('brand_interaction',{placement:'brand-directory',brand:'example',email:'private@example.invalid',query:'private',profile:'invalid'});const payload=JSON.parse(h.sent.at(-1)[1].body);assert.equal(payload.event,'brand_interaction');for(const k of ['brand','email','query','profile'])assert.equal(Object.hasOwn(payload.properties,k),false);assert.equal(payload.properties.$ip,null);assert.equal(payload.properties.placement,'brand-directory')});
test('unknown conversions are rejected and revocation stops future events',()=>{const h=harness();assert.equal(h.api.push('sale_completed'),false);h.revoke();assert.equal(h.api.push('hero_view'),false);assert.equal(h.api.getSnapshot().length,0)});
test('encyclopedia remains excluded from telemetry even after consent',()=>{const h=harness('granted','landerrio.com.br','/enciclopedia/');assert.equal(h.api.push('brand_interaction'),false);assert.equal(h.sent.length,0)});
test('web vitals only accept finite documented metrics and drop diagnostic details',()=>{const h=harness();assert.equal(h.api.push('web_vital',{metric:'LCP',value:1234.56789,rating:'good',entries:[{url:'private'}]}),true);const e=h.api.getSnapshot().at(-1);assert.equal(e.value,1234.568);assert.equal(e.metric,'LCP');assert.equal(e.release,'digital-flagship-2026-rc14.2');assert.equal(Object.hasOwn(e,'entries'),false);assert.equal(Object.hasOwn(e,'contact_reference'),false);for(const value of [NaN,Infinity,-1,600001])assert.equal(h.api.push('web_vital',{metric:'LCP',value,rating:'good'}),false);assert.equal(h.api.push('web_vital',{metric:'secret',value:1,rating:'good'}),false)});
test('web vitals respect denial, revocation and health page exclusion',()=>{for(const h of [harness('denied'),harness('granted','landerrio.com.br','/marcas/life-peptideos/')]){assert.equal(h.api.isEnabled(),false);assert.equal(h.api.push('web_vital',{metric:'CLS',value:0,rating:'good'}),false);assert.equal(h.sent.length,0)}const h=harness();assert.equal(h.api.isEnabled(),true);h.revoke();assert.equal(h.api.isEnabled(),false);assert.equal(h.api.push('web_vital',{metric:'INP',value:40,rating:'good'}),false)});

test('resource download clicks are distinguished from registrations and sales',()=>{const h=harness();for(const action of ['download-diario-de-treino-csv','download-lista-de-compras-semanal-csv']){assert.equal(h.api.push('cta_interaction',{action}),true);assert.equal(h.api.getSnapshot().at(-1).action,action);assert.equal(h.api.getSnapshot().at(-1).event,'cta_interaction')}h.api.push('cta_interaction',{action:'free-form-private-text'});assert.equal(Object.hasOwn(h.api.getSnapshot().at(-1),'action'),false);h.revoke();assert.equal(h.api.push('cta_interaction',{action:'download-diario-de-treino-csv'}),false)});

// Commercial receipt is a separate outcome from WhatsApp opening or tool registration.
test('commercial saved event needs backend confirmation and strips contact fields',()=>{
 const h=harness('granted','landerrio.com.br','/varejo/');
 assert.equal(h.api.push('commercial_request_saved',{profile:'varejo'}),false);
 assert.equal(h.api.push('commercial_request_saved',{profile:'varejo',backend_confirmed:false}),false);
 assert.equal(h.api.push('commercial_request_saved',{profile:'varejo',backend_confirmed:true,email:'synthetic@example.invalid',name:'Synthetic QA',receipt:'LR-PRIVATE',origin:{private:'discard'}}),true);
 const payload=JSON.parse(h.sent.at(-1)[1].body);
 assert.equal(payload.event,'commercial_request_saved');
 assert.equal(payload.properties.profile,'varejo');
 for(const k of ['email','name','receipt','origin','backend_confirmed'])assert.equal(Object.hasOwn(payload.properties,k),false);
 for(const denied of [harness('denied','landerrio.com.br','/varejo/'),harness('granted','landerrio.com.br','/marcas/life-peptideos/')])assert.equal(denied.api.push('commercial_request_saved',{backend_confirmed:true}),false);
});

test('production transport stamps the canonical host without disclosing the page URL', () => {
 const host = 'landerrio.com.br';
 const {api, sent, revoke} = harness('granted', host, '/varejo/');
 api.push('commercial_request_saved', {
  backend_confirmed: true,
  $host: 'test.invalid',
  $current_url: 'https://test.invalid/customer?name=nonpublic',
  $referrer: 'https://test.invalid/referrer'
 });
 assert.deepEqual(sent.map(([, options]) => JSON.parse(options.body).event), ['site_visit', 'commercial_request_saved']);
 for (const [, options] of sent) {
  const {properties} = JSON.parse(options.body);
  assert.equal(properties.$host, host);
  assert.equal(Object.hasOwn(properties, '$current_url'), false);
  assert.equal(Object.hasOwn(properties, '$referrer'), false);
  assert.equal(options.referrerPolicy, 'no-referrer');
 }
 revoke();
 assert.equal(api.push('site_visit'), false);
 assert.equal(sent.length, 2);
});

test('preview and lookalike hosts never send events or claim production origin', () => {
 for (const host of ['localhost', 'lander-rio-v8-preview.netlify.app', 'landerrio.com.br.test.invalid']) {
  const {api, sent} = harness('granted', host);
  api.push('cta_interaction', {$host: 'landerrio.com.br'});
  assert.equal(sent.length, 0);
  assert.ok(api.getSnapshot().every(event => !Object.hasOwn(event, '$host')));
 }
});
