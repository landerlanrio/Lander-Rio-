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
