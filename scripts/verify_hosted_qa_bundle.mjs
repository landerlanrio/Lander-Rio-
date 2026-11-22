// Local bundling proof with synthetic fetch responses only. Never deploys or calls hosted services.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const args=process.argv.slice(2),opt=(name,fallback)=>{const index=args.indexOf(name);return index>=0?args[index+1]:fallback;};
const tree=opt('--tree','/workspace/lander-hosted-qa'),out=opt('--out','/workspace/audit/hosted-qa-bundle');
const tools=opt('--tools',process.env.LR_QA_TOOLS_DIR||'/tmp/lander-commercial-tools-ci');
const {zipFunctions}=await import(pathToFileURL(tools+'/node_modules/@netlify/zip-it-and-ship-it/dist/main.js').href);
await mkdir(out,{recursive:true});
const bundles=await zipFunctions(tree+'/netlify/functions',out+'/archives',{basePath:tree,archiveFormat:'zip',config:{'*':{nodeBundler:'esbuild'}}});
const routeProof=[];let networkCalls=0;const observed=[];
const origin='https://lander-rio-commercial-hml-20261122.netlify.app',endpoint='https://riplqdzgwlggvhbznovm.supabase.co/functions/v1/commercial-capture-hml';
const values={COMMERCIAL_ALLOWED_ORIGIN:origin,COMMERCIAL_EDGE_ENDPOINT:endpoint,COMMERCIAL_EDGE_ANON_KEY:'synthetic-qa-key-never-a-hosted-credential'};
globalThis.Netlify={env:{get:key=>values[key]}};
globalThis.fetch=async(target,options)=>{networkCalls++;assert.ok(target===endpoint||target===endpoint+'/health');observed.push({endpoint:target,origin:options.headers.origin});if(target.endsWith('/health'))return Response.json({environment:'isolated-staging',supabase_project_id:'riplqdzgwlggvhbznovm',storage_ready:true,crm_sync_enabled:false,outbound_enabled:false});return Response.json({ok:true,saved:true,receipt:'LR-'+'A'.repeat(32),duplicate:false,crm_status:'pending'},{status:201});};
for(const item of bundles){
 const extracted=out+'/'+item.name;await mkdir(extracted,{recursive:true});const unzip=spawnSync('unzip',['-o',item.path,'-d',extracted],{encoding:'utf8'});assert.equal(unzip.status,0);
 const mod=await import(pathToFileURL(extracted+'/'+item.name+'.mjs').href);
 routeProof.push({name:item.name,config:mod.config,runtime:item.runtime,archive_bytes:(await import('node:fs/promises')).stat(item.path).then(x=>x.size)});
 const make=(url,method='POST')=>new Request(url,{method,headers:{origin,'content-type':'application/json'},...(method==='POST'?{body:JSON.stringify({request_id:'00000000-0000-4000-8000-000000000001',profile:'varejo',intent:'consulta',email:'qa@example.test',privacy_ack:true})}:{})});
 if(item.name==='commercial-lead'){
  let r=await mod.default(make(origin+'/api/commercial/lead'));assert.equal(r.status,201);assert.equal((await r.json()).saved,true);assert.match(r.headers.get('x-robots-tag'),/noindex/);
  const before=networkCalls;values.COMMERCIAL_SUPABASE_URL='https://artcokrtuqppgtawuczq.supabase.co';r=await mod.default(make(origin+'/api/commercial/lead'));assert.equal(r.status,503);assert.equal(networkCalls,before);delete values.COMMERCIAL_SUPABASE_URL;
  delete values.COMMERCIAL_EDGE_ENDPOINT;r=await mod.default(make(origin+'/api/commercial/lead'));assert.equal(r.status,503);assert.equal(networkCalls,before);values.COMMERCIAL_EDGE_ENDPOINT=endpoint;
 }else if(item.name==='commercial-health'){const r=await mod.default(make(origin+'/api/commercial/health','GET'));assert.equal(r.status,200);assert.equal((await r.json()).supabase_project_id,'riplqdzgwlggvhbznovm');}
 else{const before=networkCalls;for(const method of ['GET','POST']){const r=await mod.default(make(origin+'/api/workout/lead',method));assert.equal(r.status,503);assert.match(r.headers.get('x-robots-tag'),/noindex/);}assert.equal(networkCalls,before);}
}
for(const x of routeProof)x.archive_bytes=await x.archive_bytes;
const headers=await readFile(tree+'/site/_headers','utf8');assert.match(headers,/\/\*\n  X-Robots-Tag: noindex, nofollow, noarchive/);assert.match(headers,/connect-src 'self';/);assert.doesNotMatch(headers,/connect-src[^;]*(posthog|analytics|supabase)/);
const redirects=await readFile(tree+'/site/_redirects','utf8');assert.doesNotMatch(redirects,/^\/api\/.*https?:/m);
const proof={passed:true,source_commit:'8d0abe8cb3cddc19795fd2a841c0f95ae1bc9aae',published:false,bundler:'@netlify/zip-it-and-ship-it@16.6.0',functions:routeProof,simulatedCalls:observed,realNetworkCalls:0,directRpcFallbackDisabled:true,allNonCommercialAPIDisabled:true,staticNoindex:true,limits:['Local bundle and mocked edge acknowledgment only; hosted route precedence, edge and credentials require QA deployment verification']};
await writeFile(out+'/proof.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
