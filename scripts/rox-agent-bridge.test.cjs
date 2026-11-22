'use strict';
// Browser-isolated integration smoke tests. No real requests, payment, contacts, or writes.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=read('prototypes/rox-ai-v2/agent-v3.mjs');
const browser=read('site/assets/rox-agent-v3-offline.js');
const widget=read('site/assets/rox-demo-v25.js');
const page=read('site/index.html');
const header="/* LANDER RIO — ROX v3 offline browser, generated from prototypes/rox-ai-v2/agent-v3.mjs. No network, cookies or storage. */\n(function(){'use strict';\n";
const footer="\nwindow.LanderRoxAgentV3=Object.freeze({agentTurnV3,buildHumanHandoff,ROX_AGENT_VERSION});\n})();\n";
test('browser engine is derived exactly from offline v3 source',()=>{
 const expected=header+engine.replace(/^export const /gm,'const ').replace(/^export function /gm,'function ')+footer;
 assert.equal(browser,expected);
});
function env(loadAgent=true){
 class E{
  constructor(name){this.name=name;this.hidden=true;this.disabled=false;this.value='';this.textContent='';this.children=[];this.dataset={};this.listeners={};this.attrs={};this.scrollTop=0;this.scrollHeight=100}
  addEventListener(n,cb){(this.listeners[n]??=[]).push(cb)}
  fire(n,extra={}){for(const cb of this.listeners[n]??[])cb({target:this,preventDefault(){},...extra})}
  setAttribute(n,v){this.attrs[n]=String(v)}
  querySelector(s){return this.map?.[s]??null}
  querySelectorAll(s){return s==='button'?this.children.filter(x=>x.name==='button'):[]}
  appendChild(x){this.children.push(x)}
  focus(){this.focused=true}
  closest(){return this}
 }
 const root=new E('root'),launcher=new E('launcher'),panel=new E('panel'),closer=new E('closer');
 const log=new E('log'),form=new E('form'),input=new E('input'),quick=new E('quick'),handoff=new E('handoff'),submit=new E('submit');
 root.map={'[data-rox-launcher]':launcher,'[data-rox-dialog]':panel,'[data-rox-close]':closer,'[data-rox-log]':log,'[data-rox-form]':form,'[data-rox-input]':input,'[data-rox-quick]':quick,'[data-rox-handoff]':handoff};
 form.map={'button[type="submit"]':submit};quick.children=[new E('button')];
 const doc={activeElement:launcher,createElement:n=>new E(n),querySelector:n=>n==='[data-rox-root]'?root:null};
 const window={};let outbound=0;
 if(loadAgent)vm.runInNewContext(browser,{window},{timeout:2000});
 vm.runInNewContext(widget,{window,document:doc,encodeURIComponent,fetch(){outbound++;throw Error('Unexpected network request')}},{timeout:2000});
 function ask(message){input.value=message;form.fire('submit');return log.children.at(-1)?.textContent}
 return {window,root,launcher,panel,closer,log,form,input,quick,handoff,submit,ask,requests:()=>outbound};
}
test('homepage loads the safe agent before ROX UI',()=>{
 assert(page.indexOf('/assets/rox-agent-v3-offline.js')>=0);
 assert(page.indexOf('/assets/rox-agent-v3-offline.js')<page.indexOf('/assets/rox-demo-v25.js'));
});
test('wholesale and follow-up preserve only the segment in ephemeral context',()=>{
 const x=env();assert.equal(x.window.LanderRoxDemo.agentConnected,true);
 x.ask('Quero revender no atacado');assert.equal(x.handoff.hidden,false);
 assert.equal(x.handoff.dataset.profile,'atacado');
 x.ask('Quero catálogo');assert.equal(x.handoff.dataset.profile,'atacado');
 assert.match(decodeURIComponent(x.handoff.href),/catálogo|catalogo/i);
 assert.equal(x.requests(),0);
});
test('clinical request clears any earlier sales handoff',()=>{
 const x=env();x.ask('Quero revender no atacado');
 x.ask('Quanto custa Ozempic?');
 assert.equal(x.handoff.hidden,true);assert.equal(x.handoff.href,'');
 assert.match(x.log.children.at(-1).textContent,/não indicamos doses/i);
 assert.equal(x.requests(),0);
});
test('privacy blocks handoff and never copies raw input into a commercial draft',()=>{
 const x=env();x.ask('Quero revender no atacado');
 x.ask('Meu CPF é 123.456.789-09');
 assert.equal(x.handoff.hidden,true);assert.equal(x.handoff.href,'');
 assert.match(x.log.children.at(-1).textContent,/não envie CPF/i);
 assert.equal(x.requests(),0);
});
test('unrelated iPhone question is not a LANDER commerce lead',()=>{
 const x=env();x.ask('Quanto custa um iPhone?');
 assert.equal(x.handoff.hidden,true);assert.equal(x.requests(),0);
});
test('training answers stay educational',()=>{
 const x=env();x.ask('Como organizar meus treinos?');
 assert.match(x.log.children.at(-1).textContent,/treino|treinamento/i);
 assert.equal(x.handoff.hidden,true);
});
test('free fallback still works if optional engine is unavailable',()=>{
 const x=env(false);assert.equal(x.window.LanderRoxDemo.agentConnected,false);
 x.ask('Sou revendedor');assert.equal(x.handoff.hidden,false);
 x.ask('Ozempic preço');assert.equal(x.handoff.hidden,true);
 assert.equal(x.requests(),0);
});
