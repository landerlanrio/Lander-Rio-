// Local QA bundle proof with synthetic fetch responses only. Never deploys or calls hosted services.
import {mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const args=process.argv.slice(2),opt=(name,fallback)=>{const index=args.indexOf(name);return index>=0?args[index+1]:fallback;};
const tree=opt('--tree','/workspace/lander-hosted-qa-v2'),out=opt('--out','/workspace/audit/hosted-qa-v2-bundle');
const tools=opt('--tools',process.env.LR_QA_TOOLS_DIR||'/tmp/lander-commercial-tools-ci');
const {zipFunctions}=await import(pathToFileURL(tools+'/node_modules/@netlify/zip-it-and-ship-it/dist/main.js').href);
const preparation=JSON.parse(await readFile(tree+'/QA_PREPARATION_REPORT.json','utf8'));
assert.equal(preparation.qa_environment_enforced,'isolated-staging');
const {STAGING_CAPTURE_VERSION}=await import(pathToFileURL(tree+'/commercial-capture/staging-edge.mjs').href);
await mkdir(out,{recursive:true});
const bundles=await zipFunctions(tree+'/netlify/functions',out+'/archives',{basePath:tree,archiveFormat:'zip',config:{'*':{nodeBundler:'esbuild'}}});
const routeProof=[],guardChecks=[];let networkCalls=0;const observed=[];
const origin='https://lander-rio-commercial-hml-20261122.netlify.app',endpoint='https://riplqdzgwlggvhbznovm.supabase.co/functions/v1/commercial-capture-hml';
const baseline={COMMERCIAL_ALLOWED_ORIGIN:origin,COMMERCIAL_EDGE_ENDPOINT:endpoint,COMMERCIAL_EDGE_ANON_KEY:'synthetic-qa-key-never-a-hosted-credential',COMMERCIAL_EDGE_ENVIRONMENT:'isolated-staging'};
let values={...baseline};
globalThis.Netlify={env:{get:key=>values[key]}};
globalThis.fetch=async(target,options)=>{
 networkCalls++;assert.ok(target===endpoint||target===endpoint+'/health','Only the isolated staging endpoint may be attempted');
 observed.push({endpoint:target,origin:options.headers.origin});
 if(target.endsWith('/health'))return Response.json({environment:'isolated-staging',supabase_project_id:'riplqdzgwlggvhbznovm',storage_ready:true,crm_sync_enabled:false,outbound_enabled:false,version:STAGING_CAPTURE_VERSION});
 return Response.json({ok:true,saved:true,receipt:'LR-'+'A'.repeat(32),duplicate:false,crm_status:'pending'},{status:201});
};
for(const item of bundles){
 const extracted=out+'/'+item.name;await mkdir(extracted,{recursive:true});
 const unzip=spawnSync('unzip',['-o',item.path,'-d',extracted],{encoding:'utf8'});assert.equal(unzip.status,0);
 const mod=await import(pathToFileURL(extracted+'/'+item.name+'.mjs').href);
 routeProof.push({name:item.name,config:mod.config,runtime:item.runtime,archive_bytes:(await stat(item.path)).size});
 const isHealth=item.name==='commercial-health',isLead=item.name==='commercial-lead';
 const make=(method=isHealth?'GET':'POST')=>new Request(origin+(isHealth?'/api/commercial/health':'/api/commercial/lead'),{method,headers:{origin,'content-type':'application/json'},...(method==='POST'?{body:JSON.stringify({request_id:'00000000-0000-4000-8000-000000000001',profile:'varejo',intent:'consulta',email:'qa@example.test',privacy_ack:true})}:{})});
 values={...baseline};
 if(isLead||isHealth){
  const response=await mod.default(make());assert.equal(response.status,isHealth?200:201);assert.match(response.headers.get('x-robots-tag'),/noindex/);
  const body=await response.json();if(isHealth){assert.equal(body.supabase_project_id,'riplqdzgwlggvhbznovm');assert.equal(body.environment,'isolated-staging');assert.equal(body.version,STAGING_CAPTURE_VERSION);}else assert.equal(body.saved,true);
  const invalid=[
   ['production mode and endpoint',{COMMERCIAL_EDGE_ENVIRONMENT:'production',COMMERCIAL_EDGE_ENDPOINT:'https://artcokrtuqppgtawuczq.supabase.co/functions/v1/commercial-capture-entry',COMMERCIAL_ALLOWED_ORIGIN:'https://landerrio.com.br'}],
   ['production mode alone',{COMMERCIAL_EDGE_ENVIRONMENT:'production'}],
   ['missing environment',{COMMERCIAL_EDGE_ENVIRONMENT:undefined}],
   ['wrong environment',{COMMERCIAL_EDGE_ENVIRONMENT:'unknown'}],
   ['missing edge endpoint',{COMMERCIAL_EDGE_ENDPOINT:undefined}],
   ['production endpoint with isolated mode',{COMMERCIAL_EDGE_ENDPOINT:'https://artcokrtuqppgtawuczq.supabase.co/functions/v1/commercial-capture-entry'}],
   ['direct RPC URL',{COMMERCIAL_SUPABASE_URL:'https://artcokrtuqppgtawuczq.supabase.co'}],
   ['direct RPC key',{COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY:'synthetic-key-that-must-never-be-used'}],
   ['direct fixture mode',{COMMERCIAL_DIRECT_FIXTURE:'true'}]
  ];
  for(const [label,changes] of invalid){values={...baseline,...changes};const before=networkCalls;const rejected=await mod.default(make());assert.equal(rejected.status,503,item.name+': '+label);assert.equal(networkCalls,before,item.name+' must reject '+label+' before network');assert.match(rejected.headers.get('x-robots-tag'),/noindex/);guardChecks.push({function:item.name,case:label,status:503,networkCalls:0});}
 }else{
  const before=networkCalls;
  for(const method of ['GET','POST']){const response=await mod.default(make(method));assert.equal(response.status,503);assert.match(response.headers.get('x-robots-tag'),/noindex/);}
  assert.equal(networkCalls,before);
 }
}
const headers=await readFile(tree+'/site/_headers','utf8');assert.match(headers,/\/\*\n  X-Robots-Tag: noindex, nofollow, noarchive/);assert.match(headers,/connect-src 'self';/);assert.doesNotMatch(headers,/connect-src[^;]*(posthog|analytics|supabase)/);
assert.doesNotMatch(await readFile(tree+'/site/_redirects','utf8'),/^\/api\/.*https?:/m);
const manifestBytes=await readFile(tree+'/QA_TREE_MANIFEST.json');
const proof={passed:true,source_commit:preparation.source_commit,qa_tree_manifest_sha256:createHash('sha256').update(manifestBytes).digest('hex'),published:false,bundler:'@netlify/zip-it-and-ship-it@16.6.0',functions:routeProof,guardChecks,simulatedCalls:observed,realNetworkCalls:0,qaEnvironmentEnforced:'isolated-staging',productionEnvironmentRejected:true,directRpcFallbackDisabled:true,allNonCommercialAPIDisabled:true,staticNoindex:true,htmlUIUnchanged:preparation.html_ui_unchanged,limits:['Local bundle and mocked edge acknowledgment only; hosted route precedence, edge and credentials require QA deployment verification']};
await writeFile(out+'/proof.json',JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({passed:proof.passed,source_commit:proof.source_commit,manifest_sha256:proof.qa_tree_manifest_sha256,functions:routeProof.length,guardChecks:guardChecks.length,realNetworkCalls:0,proof:out+'/proof.json'},null,2));
