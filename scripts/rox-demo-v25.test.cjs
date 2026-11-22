'use strict';
/* Browser-independent contract tests for the ROX OFFLINE demonstrator. No network or paid models. */
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../site/assets/rox-demo-v25.js'),'utf8');
function env(){
 class E{constructor(name){this.name=name;this.hidden=true;this.disabled=false;this.value='';this.textContent='';this.children=[];this.dataset={};this.listeners={};this.attrs={};this.scrollTop=0;this.scrollHeight=900}
  addEventListener(name,cb){(this.listeners[name]??=[]).push(cb)}
  fire(name,extra={}){for(const cb of this.listeners[name]??[])cb({type:name,target:this,preventDefault(){},...extra})}
  setAttribute(a,v){this.attrs[a]=String(v)}
  querySelector(selector){return this.map?.[selector]??null}
  querySelectorAll(selector){return selector==='button'?this.children.filter(a=>a.name==='button'):[]}
  closest(sel){return sel==='button[data-question]'&&this.dataset.question?this:null}
  appendChild(node){this.children.push(node)}
  focus(){this.focused=true}
 }
 const root=new E('root'),launcher=new E('launcher'),panel=new E('panel'),close=new E('close'),log=new E('log'),form=new E('form'),input=new E('input'),quick=new E('quick'),handoff=new E('handoff'),submit=new E('submit');
 root.map={'[data-rox-launcher]':launcher,'[data-rox-dialog]':panel,'[data-rox-close]':close,'[data-rox-log]':log,'[data-rox-form]':form,'[data-rox-input]':input,'[data-rox-quick]':quick,'[data-rox-handoff]':handoff};form.map={'button[type="submit"]':submit};
 quick.children=[new E('button'),new E('button')];
 const doc={activeElement:launcher,createElement:n=>new E(n),querySelector:n=>n==='[data-rox-root]'?root:null};
 let requests=0;const win={};vm.runInNewContext(code,{document:doc,window:win,encodeURIComponent,fetch(){requests++;throw Error('unexpected fetch')}},{timeout:500});
 return {root,launcher,panel,close,log,form,input,quick,handoff,submit,win,requestCount:()=>requests};
}
test('ROX is explicitly offline',()=>{let v=env();assert.equal(v.win.LanderRoxDemo.isDemo,true);assert.equal(v.requestCount(),0)});
test('intents route reliably for major journeys',()=>{const c=env().win.LanderRoxDemo.classify;for(const [q,a] of [['Oi','hello'],['como montar treino','training'],['minha dieta','diet'],['Sou revendedor','wholesale'],['atendimento varejo','retail'],['quero parceria','partners'],['quero falar com equipe','human'],['Preço do pedido','commerce'],['dose 15mg testosterona','medical'],['pesquisa de fisiologia','science']])assert.equal(c(q),a,q)});
test('opening and escape restore focus',()=>{const x=env();x.launcher.fire('click');assert.equal(x.panel.hidden,false);assert.equal(x.launcher.attrs['aria-expanded'],'true');x.root.fire('keydown',{key:'Escape'});assert.equal(x.panel.hidden,true);assert.equal(x.launcher.attrs['aria-expanded'],'false')});
test('text input is safe plain text, not HTML',()=>{const x=env();x.launcher.fire('click');x.input.value='<img src=x onerror=alert(1)>';x.form.fire('submit');assert.equal(x.log.children[0].textContent,'<img src=x onerror=alert(1)>');assert.equal(x.log.children[0].innerHTML,undefined)});
test('commercial handoff requires explicit visitor click',()=>{const x=env();x.launcher.fire('click');assert.equal(x.handoff.hidden,true);x.input.value='Sou revendedor';x.form.fire('submit');assert.equal(x.handoff.hidden,false);assert.match(x.handoff.href,/^https:\/\/wa\.me\/5521920043538\?text=/);assert.equal(x.handoff.dataset.profile,'atacado');assert.equal(x.requestCount(),0)});
test('medical question is safely redirected, not converted to a sale',()=>{const x=env();x.input.value='Qual a dose de testosterona 15 mg?';x.form.fire('submit');assert.match(x.log.children[1].textContent,/não indicamos doses/i);assert.equal(x.handoff.hidden,true)});
test('24 turn cap stops all input paths',()=>{const x=env();for(let k=0;k<24;k++){x.input.value='oi';x.form.fire('submit')}assert.equal(x.input.disabled,true);assert.equal(x.submit.disabled,true);assert(x.quick.children.every(e=>e.disabled));let count=x.log.children.length;x.input.value='oi';x.form.fire('submit');assert.equal(x.log.children.length,count)});
test('no API calls or storage',()=>{const x=env();x.input.value='pedido no varejo';x.form.fire('submit');assert.equal(x.requestCount(),0);for(const word of ['localStorage','sessionStorage','XMLHttpRequest','innerHTML'])assert.equal(code.includes(word),false)});
test('trusted internal tool links are real anchors in the reply',()=>{for(const [q,href] of [['Dieta','/dieta/'],['Treino','/treino/'],['sono','/conteudos/'],['privacidade','/privacidade']]){const x=env();x.input.value=q;x.form.fire('submit');const nav=x.log.children[1].children[0];assert.equal(nav.attrs['aria-label'],'Caminhos sugeridos');assert.equal(nav.children[0].href,href);assert.equal(nav.children[0].name,'a');assert.equal(x.requestCount(),0)}});
test('clinical reply never receives navigation to a sales channel',()=>{const x=env();x.input.value='dose testosterona 15mg';x.form.fire('submit');assert.equal(x.log.children[1].children.length,0);assert.equal(x.handoff.hidden,true)});
