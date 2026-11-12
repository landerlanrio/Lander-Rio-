/* ROX offline browser behavior gate. Runs without DOM packages, network or paid APIs. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../site/assets/rox-demo-v24.js'),'utf8');

function harness(){
  class Element{
    constructor(name){
      this.name=name;this.hidden=true;this.disabled=false;this.inert=false;
      this.value='';this.textContent='';this.dataset={};this.listeners={};this.attributes={};
      this.children=[];this.scrollTop=0;this.scrollHeight=100;
    }
    addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
    dispatch(type,extra={}){(this.listeners[type]||[]).forEach(fn=>fn({type,target:this,preventDefault(){},...extra}))}
    setAttribute(k,v){this.attributes[k]=String(v)}
    focus(){}
    appendChild(el){this.children.push(el)}
    querySelector(selector){return this.map?.[selector]||null}
    closest(selector){if(selector==='button[data-question]'&&this.dataset.question)return this;return null}
  }
  const root=new Element('root'),launcher=new Element('launcher'),panel=new Element('panel'),closer=new Element('close'),
        form=new Element('form'),input=new Element('input'),log=new Element('log'),quick=new Element('quick'),
        handoff=new Element('handoff'),submit=new Element('submit');
  root.map={
    '[data-rox-launcher]':launcher,'[data-rox-panel]':panel,'[data-rox-close]':closer,
    '[data-rox-form]':form,'[data-rox-input]':input,'[data-rox-log]':log,
    '[data-rox-quick]':quick,'[data-rox-handoff]':handoff
  };
  form.map={'button[type=submit]':submit};
  const document={
    createElement:n=>new Element(n),
    querySelector:s=>s==='[data-rox-root]'?root:null,
    listeners:{},
    addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)},
    dispatch(type,extra={}){(this.listeners[type]||[]).forEach(fn=>fn({type,target:null,preventDefault(){},...extra}))}
  };
  let networkCalls=0;
  const win={};
  const ctx={window:win,document,URL,encodeURIComponent,fetch(){networkCalls++;throw Error('unexpected fetch')}};
  vm.runInNewContext(src,ctx,{timeout:500});
  return {win,document,root,launcher,panel,closer,form,input,log,quick,handoff,submit,network:()=>networkCalls};
}
test('ROX remains an offline demonstrator',()=>{
  const h=harness();
  assert.equal(h.win.LanderRoxDemo.isDemo,true);
  assert.equal(h.network(),0);
});
test('general phone price is not misrouted as wholesale',()=>{
  const {classify}=harness().win.LanderRoxDemo;
  assert.equal(classify('Quanto custa um iPhone 17?'),'other');
  assert.equal(classify('Qual o preço dos produtos da LANDER?'),'commercial');
});
test('intent routing differentiates commercial, content, clinical and greeting',()=>{
  const c=harness().win.LanderRoxDemo.classify;
  const cases=[
    ['Oi!','hello'],['Como faço meu treino de musculação?','training'],
    ['Quero planejar minha dieta','nutrition'],['Sou revendedor no atacado','wholesale'],
    ['Quero comprar para mim no varejo','retail'],['Quero uma parceria','partnership'],
    ['Preciso falar com humano','handoff'],['O que é a LANDER RIO?','about'],
    ['Qual dose de testosterona em mg?','clinical'],['Quero pesquisar o conteúdo','science'],
    ['Como cuidar da privacidade de dados?','privacy']
  ];
  for(const [question,expected] of cases)assert.equal(c(question),expected,question);
});
test('click to open, submit, close with Escape',()=>{
  const h=harness();
  h.launcher.dispatch('click');
  assert.equal(h.panel.hidden,false);
  assert.equal(h.launcher.attributes['aria-expanded'],'true');
  h.input.value='Como funciona o treino?';
  h.form.dispatch('submit');
  assert.equal(h.log.children.length,2);
  assert.match(h.log.children[1].textContent,/planejador de treino/i);
  assert.equal(h.input.value,'');
  h.root.dispatch('keydown',{key:'Escape'});
  assert.equal(h.panel.hidden,true);
  assert.equal(h.network(),0);
});
test('handoff requires explicit link and never sends automatically',()=>{
  const h=harness();
  h.launcher.dispatch('click');
  h.input.value='Sou revendedor no atacado';
  h.form.dispatch('submit');
  assert.equal(h.handoff.hidden,false);
  assert.match(h.handoff.href,/^https:\/\/wa\.me\/5521920043538\?text=/);
  assert.equal(h.handoff.dataset.profile,'atacado');
  assert.equal(h.network(),0);
});
test('visitor message is rendered as text rather than markup',()=>{
  const h=harness();
  h.launcher.dispatch('click');
  const malicious='<img src=x onerror=alert(1)>';
  h.input.value=malicious;
  h.form.dispatch('submit');
  assert.equal(h.log.children[0].textContent,malicious);
  assert.equal(h.log.children[0].innerHTML,undefined);
  assert.equal(h.network(),0);
});
test('turn guard limits offline demonstration',()=>{
  const h=harness();h.launcher.dispatch('click');
  for(let i=0;i<24;i++){h.input.value='oi';h.form.dispatch('submit')}
  assert.equal(h.input.disabled,true);
  assert.equal(h.submit.disabled,true);
  assert.equal(h.network(),0);
});
