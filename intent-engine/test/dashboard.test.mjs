import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/<script id="snapshot" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
function makeContext(){
const nodes={};const el=(id)=>nodes[id]??=({value:id==='#filter'?'all':'',textContent:id==='#snapshot'?JSON.stringify(data):'',innerHTML:'',handlers:{},addEventListener(name,cb){this.handlers[name]=cb},showModal(){this.open=true},close(){this.open=false}});
const context={document:{querySelector:el,getElementById:(id)=>id==='snapshot'?{textContent:JSON.stringify(data)}:el('#'+id)},location:{protocol:'file:',pathname:'/'},console,Intl,Number,String,JSON,Math,Date,URL,alert:()=>{},window:{prompt:()=>{}},navigator:{clipboard:{writeText:async()=>{}}},Blob,setTimeout:()=>{},};
vm.createContext(context);vm.runInContext(script,context);
return {nodes,el,context};
}
test('painel inicial e filtragem offline',()=>{const {el}=makeContext();assert.equal(el('#metric-pages').textContent,String(data.paginas.length));assert.equal((el('#opportunities').innerHTML.match(/<tr>/g)||[]).length,data.paginas.length);el('#search').value='cooper';el('#search').handlers.input();assert.equal((el('#opportunities').innerHTML.match(/<tr>/g)||[]).length,1);assert(el('#opportunities').innerHTML.includes('Cooper Pharma'));});
test('brief editorial exige revisao e nao altera producao',()=>{const {el}=makeContext();el('#opportunities').handlers.click({target:{closest(){return {dataset:{brief:'https://landerrio.com.br/marcas/cooper-pharma/'}}}}});assert.equal(el('#briefModal').open,true);assert(el('#briefContent').innerHTML.includes('Revisão regulatória'));el('#close2').handlers.click();assert.equal(el('#briefModal').open,false);});
test('filtro dados insuficientes e reset',()=>{const {el}=makeContext();el('#filter').value='low';el('#filter').handlers.change();assert.equal((el('#opportunities').innerHTML.match(/<tr>/g)||[]).length,data.paginas.filter(p=>p.impressoes<20).length);el('#reset').handlers.click();assert.equal((el('#opportunities').innerHTML.match(/<tr>/g)||[]).length,data.paginas.length);});
