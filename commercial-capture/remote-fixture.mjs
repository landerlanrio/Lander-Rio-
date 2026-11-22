// Disposable GitHub Actions/local QA infrastructure. No hosted credentials or services.
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdir,readFile,writeFile,appendFile,readdir,open} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const args=process.argv.slice(2),mode=args[0]||'start';
const opt=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(opt('--out',process.env.RUNNER_TEMP?join(process.env.RUNNER_TEMP,'lander-remote'):'/tmp/lander-remote'));
const stateFile=join(out,'state.json');
await mkdir(out,{recursive:true});
async function run(command,argv,{input,cwd=root,log}={}){
 return new Promise((ok,bad)=>{const child=spawn(command,argv,{cwd,env:process.env,stdio:['pipe','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',x=>{stdout+=x;if(log)process.stdout.write(x);});child.stderr.on('data',x=>{stderr+=x;if(log)process.stderr.write(x);});child.on('error',bad);child.on('close',code=>code===0?ok(stdout.trim()):bad(Object.assign(Error(command+' failed ('+code+'): '+stderr.slice(-1200)),{stdout,stderr,exitCode:code})));child.stdin.end(input);});
}
const persist=state=>writeFile(stateFile,JSON.stringify(state,null,2)+'\n');
async function waitReady(check,label){const deadline=Date.now()+60000;while(Date.now()<deadline){try{if(await check())return;}catch(error){if(error.fatal)throw error;}await new Promise(r=>setTimeout(r,500));}throw Error(label+' not ready within 60s');}
async function cleanup(state){
 if(state.qaPid){try{const cmdline=await readFile('/proc/'+state.qaPid+'/cmdline','utf8');if(cmdline.includes('commercial-capture/qa-server.mjs'))process.kill(state.qaPid,'SIGTERM');}catch{}}
 for(const name of [state.postgrest,state.postgres])if(name?.startsWith('lr-capture-'))try{await run('docker',['rm','-f',name]);}catch{}
 if(state.network?.startsWith('lr-capture-'))try{await run('docker',['network','rm',state.network]);}catch{}
}
if(mode==='stop'){
 try{const state=JSON.parse(await readFile(stateFile,'utf8'));await cleanup(state);await persist({...state,stopped:true});console.log('Disposable QA resources stopped');}catch(e){if(e.code!=='ENOENT')throw e;}
}else if(mode==='test'){
 const state=JSON.parse(await readFile(stateFile,'utf8'));
 Object.assign(process.env,state.env);
 const files=(await readdir(join(root,'commercial-capture'))).filter(p=>p.endsWith('.test.mjs')).map(p=>join(root,'commercial-capture',p));
 let success=false;
 try{const log=await run(process.execPath,['--test','--test-reporter=tap',...files]);await writeFile(join(out,'tests.tap'),log+'\n');console.log(log);success=true;}
 catch(e){await writeFile(join(out,'tests.tap'),(e.stdout||'')+'\n'+String(e)+'\n');throw e;}
 finally{
  let requests=[];try{const response=await fetch(state.env.LR_QA_BASE_URL+'/__qa/requests');requests=await response.json();}catch{}
  const safe={environment:'Disposable runner; bundled Netlify function -> loopback HTTP PostgREST -> PostgreSQL; no hosted integrations',backendTestsPassed:success,bundler:'@netlify/zip-it-and-ship-it@16.6.0',records:requests.map(r=>({receipt:r.receipt,profile:r.profile,intent:r.intent,origin:r.origin,crm_status:r.crm_status})),limits:['Netlify edge and hosted Supabase gateway are outside this runner','Loopback browser Origin is checked by the QA bridge, then represented by a fixed HTTPS fixture Origin to the compiled handler','Database-unavailable browser scenario injects RPC transport failure inside the compiled adapter; PostgreSQL remains online for operator lookup','Real HubSpot, WhatsApp and outbound systems are never invoked']};
  await writeFile(join(out,'evidence.json'),JSON.stringify(safe,null,2)+'\n');
 }
}else if(mode==='start'){
 try{const existing=JSON.parse(await readFile(stateFile,'utf8'));if(!existing.stopped)throw Error('Fixture state already exists; stop it or use another --out directory');}catch(e){if(e.code!=='ENOENT')throw e;}
 const suffix=randomBytes(5).toString('hex'),state={network:'lr-capture-net-'+suffix,postgres:'lr-capture-pg-'+suffix,postgrest:'lr-capture-rest-'+suffix,evidenceDir:resolve(opt('--evidence-dir',process.env.LR_QA_EVIDENCE_DIR||join(out,'evidence')))};
 await mkdir(state.evidenceDir,{recursive:true});await persist(state);
 try{
  console.log('Starting disposable PostgreSQL and HTTP fixtures');
  await run('docker',['network','create',state.network]);
  await run('docker',['run','--name',state.postgres,'--network',state.network,'-e','POSTGRES_HOST_AUTH_METHOD=trust','-d','postgres:17-alpine@sha256:f9cf3e1f0066f0eb0c48707d864f0ac5941e9ff454a072077d97a4d278d07d73']);
  await waitReady(async()=>{await run('docker',['exec',state.postgres,'pg_isready','-h','127.0.0.1','-U','postgres']);return true;},'PostgreSQL');
  await run('docker',['exec','-i',state.postgres,'psql','-U','postgres','-v','ON_ERROR_STOP=1'],{input:'create role anon; create role authenticated; create role service_role bypassrls;'});
  await run('docker',['exec','-i',state.postgres,'psql','-U','postgres','-v','ON_ERROR_STOP=1'],{input:await readFile(join(root,'commercial-capture/schema-proposal.sql'),'utf8')});
  await run('docker',['run','--name',state.postgrest,'--network',state.network,'-p','127.0.0.1::3000','-e','PGRST_DB_URI=postgresql://postgres@'+state.postgres+':5432/postgres','-e','PGRST_DB_SCHEMAS=public','-e','PGRST_DB_ANON_ROLE=anon','-e','PGRST_JWT_SECRET=lr-qa-only-jwt-secret-at-least-32-characters','-d','postgrest/postgrest:v13.0.4@sha256:a312f4b2e48530a01fc26f5310d547d6c26d087858360e164522e415723a7732']);
  const mapping=await run('docker',['port',state.postgrest,'3000/tcp']);if(!/^127\.0\.0\.1:\d+$/.test(mapping))throw Error('Fixture port must bind only loopback');
  const rpcURL='http://'+mapping;await waitReady(async()=>{const response=await fetch(rpcURL);return response.ok;},'PostgREST');
  const nodePath=(process.env.NODE_PATH||'').split(':').find(Boolean),tools=opt('--tools',process.env.LR_QA_TOOLS_DIR||(nodePath?.endsWith('/node_modules')?dirname(nodePath):''));
  if(!tools)throw Error('Set --tools or LR_QA_TOOLS_DIR to pinned QA tooling directory');
  const {zipFunctions}=await import(pathToFileURL(join(resolve(tools),'node_modules/@netlify/zip-it-and-ship-it/dist/main.js')).href);
  const bundleDir=join(out,'bundle');await zipFunctions(join(root,'netlify/functions'),bundleDir,{basePath:root,archiveFormat:'zip',config:{'*':{nodeBundler:'esbuild'}}});
  const extract=join(out,'compiled');await mkdir(extract,{recursive:true});await run('unzip',['-o',join(bundleDir,'commercial-lead.zip'),'-d',extract]);
  const bundlePath=join(extract,'commercial-lead.mjs'),qaPort=Number(opt('--qa-port',opt('--port',process.env.LR_QA_PORT||'3100'))),site=resolve(opt('--site',join(root,'site'))),qaLog=await open(join(out,'qa-server.log'),'a');
  const childEnv={...process.env};for(const key of Object.keys(childEnv))if(/TOKEN|SECRET|PASSWORD|API_KEY|SUPABASE|HUBSPOT|NETLIFY_AUTH|COMMERCIAL_.*URL/i.test(key))delete childEnv[key];
  const child=spawn(process.execPath,[join(root,'commercial-capture/qa-server.mjs'),'--site',site,'--port',String(qaPort),'--rpc-url',rpcURL,'--bundle',bundlePath],{cwd:root,env:childEnv,detached:true,stdio:['ignore',qaLog.fd,qaLog.fd]});child.unref();state.qaPid=child.pid;await qaLog.close();await persist(state);
  const qaURL='http://127.0.0.1:'+qaPort;await waitReady(async()=>{const healthResponse=await fetch(qaURL+'/__qa/health');if(!healthResponse.ok)return false;const health=await healthResponse.json();if(health.pid!==state.qaPid||health.backend!=='packaged_postgrest')throw Object.assign(Error('QA port is served by another process or backend'),{fatal:true});const response=await fetch(qaURL+'/__qa/requests');return response.ok&&Array.isArray(await response.json());},'QA server');
  state.env={LR_CAPTURE_POSTGRES_CONTAINER:state.postgres,LR_CAPTURE_BUNDLE_PATH:bundlePath,LR_CAPTURE_POSTGREST_URL:rpcURL,LR_QA_BASE_URL:qaURL,LR_QA_EXPECT_BACKEND:'packaged_postgrest',LR_QA_OUTPUT:resolve(process.env.LR_QA_OUTPUT||join(out,'browser'))};
  await persist(state);await writeFile(join(out,'env.json'),JSON.stringify(state.env,null,2)+'\n');
  const lines=Object.entries(state.env).map(([k,v])=>k+'='+v).join('\n')+'\n';await writeFile(join(out,'fixture.env'),lines);
  if(process.env.GITHUB_ENV)await appendFile(process.env.GITHUB_ENV,lines);
  await writeFile(join(state.evidenceDir,'fixture-evidence.json'),JSON.stringify({database:'PostgreSQL17 disposable local container',gateway:'PostgREST13.0.4 disposable local container',function:'Actual Netlify bundle with server-only imports',browserBackend:'Loopback bridge -> compiled handler -> authenticated HTTP RPC -> PostgreSQL',externalDestinations:[],usesProductionCredentials:false,requiresPaidHostedResources:false},null,2)+'\n');
  console.log('Disposable fixture ready; env.json contains only local paths/container names/loopback URLs');
 }catch(e){await cleanup(state);await persist({...state,stopped:true});throw e;}
}else throw Error('Use start, test or stop');
