/* Hosted staging acceptance. Never accepts production targets or hosted credentials. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {chromium}=require('playwright');
const QA_ORIGIN='https://lander-rio-commercial-hml-20261122.netlify.app';
const QA_SITE='3075d60e-df1e-4664-b5c5-9fbd3a189dc3';
const STAGING_PROJECT='riplqdzgwlggvhbznovm';
const STAGING_ORIGIN='https://'+STAGING_PROJECT+'.supabase.co';
const CAPTURE_PATH='/api/commercial/lead';
// The target file is completed only after the operator verifies the deployed routing/configuration.
// It contains public identifiers only; this runner has no Supabase/Netlify credentials.
const targetFile=process.env.LR_HOSTED_QA_TARGET_FILE;
assert(targetFile,'Set LR_HOSTED_QA_TARGET_FILE after the isolated deployment is verified');
const target=JSON.parse(fs.readFileSync(targetFile,'utf8'));
assert.equal(target.qa_origin,QA_ORIGIN);
assert.equal(target.netlify_site_id,QA_SITE);
assert.equal(target.supabase_project_id,STAGING_PROJECT);
assert.equal(target.capture_path,CAPTURE_PATH);
assert.equal(target.confirmed_isolated_environment,true,'Verify QA database, bridge and outbound settings before testing');
assert.match(target.netlify_deploy_id||'',/^[0-9a-f]{24}$/i,'A confirmed QA deploy is required');
assert.match(target.source_commit||'',/^[0-9a-f]{40}$/i,'The QA source commit must be recorded');
assert(Number.isFinite(Date.parse(target.configuration_verified_at||'')),'Record when the deployed destinations were checked');
const upstream=new URL(target.upstream_capture_url);
assert.equal(upstream.origin,STAGING_ORIGIN,'Upstream must be the isolated Supabase project');
assert.match(upstream.pathname,/^\/functions\/v1\/[a-z0-9-]+$/);
assert(!upstream.username&&!upstream.password&&!upstream.search&&!upstream.hash,'Never put credentials in the QA target');
assert.equal(target.health_path,'/api/commercial/health');
const out=path.resolve(process.env.LR_HOSTED_QA_OUTPUT||'/tmp/lander-hosted-qa');
fs.mkdirSync(out,{recursive:true});
const run='lr-hosted-'+randomUUID().slice(0,8);
const results=[],expectedRows=[],blockedExternal=[];
let browser,activePage,browserVersion,health=null;
function persist(extra={}) {
  fs.writeFileSync(path.join(out,'hosted-browser-results.json'),JSON.stringify({
    run,environment:'isolated hosted Netlify QA with separate Supabase staging',
    target:{qa_origin:QA_ORIGIN,netlify_site_id:QA_SITE,netlify_deploy_id:target.netlify_deploy_id,
      supabase_project_id:STAGING_PROJECT,upstream_capture_url:upstream.href,source_commit:target.source_commit,
      configuration_verified_at:target.configuration_verified_at},
    browserVersion,nodeVersion:process.version,playwrightVersion:require('playwright/package.json').version,
    health,results,expectedRows,blockedExternal,
    authenticatedDatabaseVerification:'pending separate operator SQL; an HTTP receipt alone is not proof of storage',
    liveCrmMessagesAnalyticsValidated:false,...extra
  },null,2)+'\n');
  if(expectedRows.length) {
    const ids=expectedRows.map(row=>"'"+row.request_id+"'::uuid").join(',');
    fs.writeFileSync(path.join(out,'operator-verification.sql'),
      '-- Run only in authenticated SQL for project '+STAGING_PROJECT+'. Synthetic request IDs only.\n'+
      'select request_id,receipt,profile,intent,origin,crm_status,created_at\n'+
      'from public.commercial_requests\nwhere request_id in ('+ids+')\norder by request_id;\n'+
      '-- Expected: '+expectedRows.length+' rows, each UUID exactly once, crm_status=pending.\n');
  }
}
async function runCase(name,fn) {
  try {const evidence=await fn();results.push({case:name,frontendPass:true,...evidence});persist();}
  catch(error){results.push({case:name,frontendPass:false,error:error.message});persist();throw error;}
}
async function context(width=390) {
  const instance=await browser.newContext({viewport:{width,height:900},isMobile:width<500,hasTouch:width<500});
  const external=[],errors=[],posts=[],violations=[];
  await instance.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin!==QA_ORIGIN){external.push(url.hostname);blockedExternal.push(url.hostname);return route.abort();}
    if(!['GET','HEAD'].includes(req.method())) {
      try {
        assert.equal(req.method(),'POST','Only the commercial capture POST is allowed');
        assert.equal(url.pathname,CAPTURE_PATH,'No other hosted write endpoint is allowed');
        const payload=JSON.parse(req.postData()||'{}');
        assert.match(payload.email||'',new RegExp('^'+run+'-[a-z0-9-]+@example\\.test$'),'Only this run synthetic emails are allowed');
        assert.match(payload.request_id||'',/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        posts.push(payload);
      } catch(error) {violations.push(error.message);return route.abort();}
    }
    return route.continue();
  });
  const page=await instance.newPage();activePage=page;
  page.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
  return {instance,page,external,errors,posts,violations};
}
function assertQaHeaders(headers,{api=false}={}) {
  assert((headers['x-robots-tag']||'').toLowerCase().includes('noindex'),'Hosted QA responses must exclude indexing');
  if(api) assert((headers['cache-control']||'').toLowerCase().includes('no-store'),'Hosted capture/health must not cache');
}
async function clean(state){assert.deepEqual(state.external,[]);assert.deepEqual(state.errors,[]);assert.deepEqual(state.violations,[]);}
(async()=>{
  const options={headless:true,args:['--no-sandbox']};
  if(process.env.LR_QA_CHROMIUM_EXECUTABLE)options.executablePath=process.env.LR_QA_CHROMIUM_EXECUTABLE;
  browser=await chromium.launch(options);browserVersion=browser.version();
  // Read-only confirmation before the first form submission. Root has separately verified service routing.
  const preflight=await context(390);
  const response=await preflight.page.request.get(QA_ORIGIN+target.health_path,{maxRedirects:0});
  assert(response.ok(),'QA health must respond');assertQaHeaders(response.headers(),{api:true});
  const value=await response.json();
  assert.equal(value.environment,'isolated-staging');assert.equal(value.supabase_project_id,STAGING_PROJECT);
  assert.equal(value.storage_ready,true);assert.equal(value.capture_path,CAPTURE_PATH);
  assert.equal(value.outbound_enabled,false);assert.equal(value.crm_sync_enabled,false);
  health={environment:value.environment,supabase_project_id:value.supabase_project_id,storage_ready:true,
    capture_path:CAPTURE_PATH,outbound_enabled:false,crm_sync_enabled:false,version:value.version};
  const landing=await preflight.page.goto(QA_ORIGIN+'/',{waitUntil:'networkidle'});
  assert.equal(landing.status(),200,'QA homepage must be available');assertQaHeaders(landing.headers());
  await clean(preflight);await preflight.instance.close();persist();
  let duplicateFixture;
  for(const width of [360,390,1440])for(const profile of ['varejo','atacado']) {
    await runCase('hosted-normal-'+width+'-'+profile,async()=>{
      const state=await context(width);const {page,instance,posts}=state;
      const landing=await page.goto(QA_ORIGIN+'/?utm_source=ig&utm_medium=social&utm_campaign=lr-261122',{waitUntil:'networkidle'});assertQaHeaders(landing.headers());
      await page.getByRole('button',{name:'Somente necessário',exact:true}).click();
      const navigation=page.waitForResponse(r=>r.url()===QA_ORIGIN+'/'+profile+'/'&&r.request().isNavigationRequest());
      await page.locator('.hero-cta[data-profile="'+profile+'"]').click();await page.waitForURL(QA_ORIGIN+'/'+profile+'/');
      assertQaHeaders((await navigation).headers());
      const form=page.locator('[data-commercial-request]'),email=run+'-'+width+'-'+profile+'@example.test';
      await form.locator('[name=name]').fill('Pessoa Fictícia '+width+' '+profile);
      await form.locator('[name=email]').fill(email);
      const intent=profile==='atacado'?'orcamento':'envio';await form.locator('[name=intent]').selectOption(intent);
      await form.locator('[name=privacy_ack]').check();
      const reply=page.waitForResponse(r=>r.url()===QA_ORIGIN+CAPTURE_PATH&&r.request().method()==='POST');
      await form.locator('button[type=submit]').click();const response=await reply;
      assert.equal(response.status(),201,'A new staging request should be accepted once');assertQaHeaders(response.headers(),{api:true});
      const body=await response.json();assert.equal(body.ok,true);assert.equal(body.saved,true);assert.equal(body.crm_status,'pending');
      assert.match(body.receipt||'',/^LR-[A-Z0-9-]{8,64}$/);
      await form.locator('[role=status]').filter({hasText:'Solicitação recebida e salva'}).waitFor();
      const status=await form.locator('[role=status]').innerText();assert(status.includes(body.receipt));
      assert.equal(posts.length,1);const payload=posts[0];
      assert.equal(payload.profile,profile);assert.equal(payload.intent,intent);
      assert.deepEqual(payload.origin,{entry_path:'/',page_path:'/'+profile+'/',utm_source:'instagram',utm_medium:'social',utm_campaign:'lr-261122'});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      const spacing=await page.locator('#solicitacao').boundingBox();assert(spacing.x>=16);
      await page.locator('#solicitacao').screenshot({path:path.join(out,'hosted-'+width+'-'+profile+'.png')});
      expectedRows.push({request_id:payload.request_id,receipt:body.receipt,email,profile,intent,origin:payload.origin,crm_status:'pending'});
      duplicateFixture||={payload,receipt:body.receipt};
      await clean(state);await instance.close();
      return {width,profile,email,request_id:payload.request_id,receipt:body.receipt,http:201,status,spacing,databaseVerified:false};
    });
  }
  await runCase('hosted-identical-api-retry',async()=>{
    const state=await context(390);const {page,instance,posts}=state;
    await page.goto(QA_ORIGIN+'/',{waitUntil:'networkidle'});
    const reply=await page.evaluate(async({capture,payload})=>{
      const response=await fetch(capture,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});
      return {status:response.status,body:await response.json(),headers:Object.fromEntries(response.headers)};
    },{capture:CAPTURE_PATH,payload:duplicateFixture.payload});
    assert.equal(reply.status,200);assertQaHeaders(reply.headers,{api:true});assert.equal(reply.body.ok,true);assert.equal(reply.body.saved,true);assert.equal(reply.body.duplicate,true);
    assert.equal(reply.body.receipt,duplicateFixture.receipt);assert.equal(reply.body.crm_status,'pending');assert.equal(posts.length,1);
    assert.deepEqual(posts[0],duplicateFixture.payload);await clean(state);await instance.close();
    return {http:200,duplicate:true,sameReceipt:true,request_id:duplicateFixture.payload.request_id,receipt:duplicateFixture.receipt,databaseVerified:false};
  });
  persist({frontendPassed:results.length,frontendFailed:0,expectedUniqueRequests:expectedRows.length,authenticatedDatabaseVerificationRequired:true});
  console.log(JSON.stringify({run,frontendPassed:results.length,expectedUniqueRequests:expectedRows.length,databaseVerification:'pending authenticated operator SQL',output:out}));
})().catch(async error=>{
  try{if(activePage&&!activePage.isClosed())await activePage.screenshot({path:path.join(out,'hosted-failure.png'),fullPage:true});}catch{}
  persist({frontendPassed:results.filter(r=>r.frontendPass).length,frontendFailed:results.filter(r=>!r.frontendPass).length,error:error.message});
  console.error(error.message);process.exitCode=1;
}).finally(async()=>{if(browser)await browser.close();});
