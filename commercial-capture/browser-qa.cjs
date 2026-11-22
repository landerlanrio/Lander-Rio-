/* Reproducible browser acceptance suite. Loopback fixture and fictitious contacts only. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const {chromium} = require('playwright');
const base = new URL(process.env.LR_QA_BASE_URL || 'http://127.0.0.1:3100');
assert.equal(base.protocol, 'http:', 'QA must use local HTTP');
assert(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'QA base must be loopback');
assert.equal(base.pathname, '/', 'QA base must not include a path');
assert(!base.search && !base.hash && !base.username && !base.password, 'QA URL must contain no credentials or query');
const host = base.origin;
const out = path.resolve(process.env.LR_QA_OUTPUT || '/tmp/lander-browser-qa');
fs.mkdirSync(out, {recursive:true});
const run = 'lr-qa-' + randomUUID().slice(0,8);
const results = [];
let browser, activePage, fixtureIdentity=null, browserVersion=null;
function persist(extra={}) {
  fs.writeFileSync(path.join(out,'browser-results.json'), JSON.stringify({
    run, environment:'isolated loopback fixture; fictitious contacts; no external browser requests',
    liveServicesValidated:false, fixtureIdentity, browserVersion,
    nodeVersion:process.version, playwrightVersion:require('playwright/package.json').version,
    sourceCommit:/^[0-9a-f]{40}$/i.test(process.env.GITHUB_SHA||'')?process.env.GITHUB_SHA:null, results, ...extra
  }, null, 2) + '\n');
}
async function runCase(name, action) {
  try { const evidence=await action(); results.push({case:name,pass:true,...evidence}); persist(); }
  catch(error) { results.push({case:name,pass:false,error:error.message}); persist(); throw error; }
}
async function mode(value) {
  const response=await fetch(host+'/__qa/mode', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:value})});
  assert(response.ok, 'Fixture mode must be accepted');
}
async function allRows() {
  const response=await fetch(host+'/__qa/requests');
  assert(response.ok, 'Operator lookup must respond');
  const rows=await response.json();
  assert(Array.isArray(rows), 'Operator lookup must be an array');
  return rows;
}
async function rowsFor(email) {return (await allRows()).filter(row=>row.email===email);}
function sanitizeRow(row) {
  // Deliberately retain only the synthetic proof needed to assess persistence and attribution.
  return Object.fromEntries(['request_id','receipt','profile','intent','email','origin','crm_status'].map(key=>[key,row[key]]));
}
function assertRow(row, profile, intent) {
  assert.equal(row.profile,profile); assert.equal(row.intent,intent); assert.equal(row.crm_status,'pending');
  assert.equal(row.origin.entry_path,'/'); assert.equal(row.origin.page_path,'/'+profile+'/');
  assert.equal(row.origin.utm_source,'instagram'); assert.equal(row.origin.utm_medium,'social'); assert.equal(row.origin.utm_campaign,'lr-261122');
  assert.match(row.receipt,/^LR-[A-Z0-9-]{8,64}$/);
}
async function context(width=390) {
  const instance=await browser.newContext({viewport:{width,height:900},isMobile:width<500,hasTouch:width<500});
  const external=[];
  await instance.route('**/*', route=>{
    const destination=new URL(route.request().url());
    if(destination.origin!==host) {external.push(destination.hostname); return route.abort();}
    return route.continue();
  });
  const page=await instance.newPage(); activePage=page;
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  page.setDefaultTimeout(20000);
  return {instance,page,external,errors};
}
async function prepare(width,profile,suffix,{consent=false}={}) {
  const state=await context(width); const {page}=state;
  await page.goto(host+'/?utm_source=ig&utm_medium=social&utm_campaign=lr-261122',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:consent?'Permitir medição':'Somente necessário',exact:true}).click();
  await page.locator('.hero-cta[data-profile="'+profile+'"]').click();
  await page.waitForURL(host+'/'+profile+'/');
  const form=page.locator('[data-commercial-request]');
  const email=run+'-'+suffix+'@example.test';
  const name='Pessoa Fictícia '+suffix;
  const intent=profile==='atacado'?'orcamento':'envio';
  await fill(form,{email,name,intent});
  return {...state,form,email,name,intent,profile};
}
async function fill(form,{email,name,intent}) {
  await form.locator('[name=email]').fill(email);
  await form.locator('[name=name]').fill(name);
  await form.locator('[name=intent]').selectOption(intent);
  await form.locator('[name=privacy_ack]').check();
}
async function success(form) {await form.locator('[role=status]').filter({hasText:'Solicitação recebida e salva'}).waitFor();}
async function uncertain(form) {await form.locator('[role=status]').filter({hasText:'Ainda não foi possível confirmar'}).waitFor();}
async function submit(page,form) {
  const reply=page.waitForResponse(response=>response.url()===host+'/api/commercial/lead');
  await form.locator('button[type=submit]').click();
  return reply;
}
async function verifyNoLeaks(state) {assert.deepEqual(state.external,[]); assert.deepEqual(state.errors,[]);}
(async()=>{
  const identityResponse=await fetch(host+'/__qa/health');
  if(identityResponse.ok) {
    const identity=await identityResponse.json();
    assert(['sqlite','packaged_postgrest'].includes(identity.backend), 'Unknown loopback fixture identity');
    assert(Number.isInteger(identity.pid)&&identity.pid>0, 'Fixture identity requires a running PID');
    fixtureIdentity={backend:identity.backend,pid:identity.pid};
  }
  if(process.env.LR_QA_EXPECT_BACKEND) assert.equal(fixtureIdentity?.backend,process.env.LR_QA_EXPECT_BACKEND,'Browser must reach the expected isolated backend');
  const options={headless:true,args:['--no-sandbox']};
  if(process.env.LR_QA_CHROMIUM_EXECUTABLE) options.executablePath=process.env.LR_QA_CHROMIUM_EXECUTABLE;
  browser=await chromium.launch(options); browserVersion=browser.version();
  for(const width of [360,390,1440]) for(const profile of ['varejo','atacado']) {
    await runCase('normal-'+width+'-'+profile, async()=>{
      await mode('normal'); const state=await prepare(width,profile,width+'-'+profile);
      const {page,form,email,intent,instance}=state;
      const response=await submit(page,form); assert.equal(response.status(),201);
      const body=await response.json(); assert.equal(body.ok,true); assert.equal(body.saved,true);
      await success(form);
      const rows=await rowsFor(email); assert.equal(rows.length,1); assertRow(rows[0],profile,intent);
      assert.equal(body.receipt,rows[0].receipt);
      const status=await form.locator('[role=status]').innerText(); assert(status.includes(rows[0].receipt));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      const spacing=await page.locator('#solicitacao').boundingBox(); assert(spacing.x>=16,'Form requires mobile breathing room');
      await page.locator('#solicitacao').screenshot({path:path.join(out,'normal-'+width+'-'+profile+'.png')});
      await verifyNoLeaks(state); await instance.close();
      return {width,profile,http:response.status(),count:rows.length,row:sanitizeRow(rows[0]),status,spacing,externalRequests:0,pageErrors:0};
    });
  }
  await runCase('double-click-before-persistence',async()=>{
    await mode('delay'); const state=await prepare(390,'varejo','double'); const {page,form,email,instance}=state;
    let posts=0; page.on('request',request=>{if(request.url()===host+'/api/commercial/lead') posts++;});
    await form.locator('button[type=submit]').evaluate(button=>{button.click();button.click();});
    await page.waitForTimeout(200);
    const earlyStatus=await form.locator('[role=status]').innerText(); assert(earlyStatus.includes('Salvando'));
    assert(!earlyStatus.includes('recebida')); assert.equal((await rowsFor(email)).length,0);
    await success(form); const rows=await rowsFor(email); assert.equal(rows.length,1); assert.equal(posts,1);
    assertRow(rows[0],'varejo','envio'); await verifyNoLeaks(state); await instance.close();
    return {posts,earlyCount:0,earlyStatus,count:1,row:sanitizeRow(rows[0])};
  });
  await runCase('saved-response-timeout-retry',async()=>{
    await mode('saved_timeout'); const state=await prepare(390,'atacado','timeout'); const {page,form,email,instance}=state;
    const sent=[]; page.on('request',request=>{if(request.url()===host+'/api/commercial/lead') sent.push(JSON.parse(request.postData()));});
    await form.locator('button[type=submit]').click(); await uncertain(form);
    const uncertainty=await form.locator('[role=status]').innerText(); assert(!uncertainty.includes('Solicitação recebida e salva'));
    assert.equal((await rowsFor(email)).length,1); assert.equal(await form.locator('[name=email]').isDisabled(),true);
    const reply=await submit(page,form); assert.equal(reply.status(),200); const body=await reply.json(); assert.equal(body.duplicate,true);
    await success(form); const rows=await rowsFor(email); assert.equal(rows.length,1); assert.equal(sent.length,2); assert.deepEqual(sent[0],sent[1]);
    assert.equal(rows[0].receipt,body.receipt); assertRow(rows[0],'atacado','orcamento');
    await verifyNoLeaks(state); await instance.close();
    return {uncertainty,posts:sent.length,samePayload:true,count:1,row:sanitizeRow(rows[0])};
  });
  await runCase('database-unavailable-then-recovery',async()=>{
    await mode('database_down'); const state=await prepare(390,'varejo','database-down'); const {page,form,email,instance}=state;
    const failed=await submit(page,form); assert.equal(failed.status(),503); await uncertain(form);
    assert.equal((await rowsFor(email)).length,0);
    const failedStatus=await form.locator('[role=status]').innerText(); assert(!failedStatus.includes('Solicitação recebida e salva'));
    await page.locator('#solicitacao').screenshot({path:path.join(out,'database-unavailable.png')});
    await mode('normal'); const recovered=await submit(page,form); assert.equal(recovered.status(),201); await success(form);
    const rows=await rowsFor(email); assert.equal(rows.length,1); assertRow(rows[0],'varejo','envio');
    await verifyNoLeaks(state); await instance.close();
    return {failedHttp:503,failedCount:0,failedStatus,recoveredHttp:201,count:1,row:sanitizeRow(rows[0])};
  });
  await runCase('reload-conflict-then-original-recovery',async()=>{
    await mode('saved_timeout'); const state=await prepare(390,'varejo','reload'); const {page,email,name,intent,instance}=state;
    let form=state.form; await form.locator('button[type=submit]').click(); await uncertain(form);
    const original=(await rowsFor(email))[0]; assert(original); const before=(await allRows()).length;
    await page.reload({waitUntil:'networkidle'}); form=page.locator('[data-commercial-request]');
    const different=run+'-different@example.test'; await fill(form,{email:different,name,intent});
    const conflict=await submit(page,form); assert.equal(conflict.status(),409);
    await form.locator('[role=status]').filter({hasText:'Nenhum novo registro foi criado'}).waitFor();
    assert.equal((await allRows()).length,before); assert.equal((await rowsFor(different)).length,0);
    assert.equal(await form.locator('[name=email]').isEditable(),true);
    await fill(form,{email,name,intent}); const reply=await submit(page,form); assert.equal(reply.status(),200);
    const body=await reply.json(); assert.equal(body.duplicate,true); assert.equal(body.receipt,original.receipt); await success(form);
    const rows=await rowsFor(email); assert.equal(rows.length,1); assert.equal((await allRows()).length,before);
    await verifyNoLeaks(state); await instance.close();
    return {conflictHttp:409,conflictCreated:0,recoveredHttp:200,sameReceipt:true,count:1,row:sanitizeRow(rows[0])};
  });
  await runCase('consented-saved-event-no-personal-data',async()=>{
    await mode('database_down'); const state=await prepare(390,'varejo','events',{consent:true}); const {page,form,email,name,instance}=state;
    assert.equal(await page.evaluate(()=>LanderMeasurement.push('commercial_request_saved',{profile:'varejo'})),false);
    const before=await page.evaluate(()=>LanderMeasurement.getSnapshot()); assert.equal(before.filter(e=>e.event==='commercial_request_saved').length,0);
    const failed=await submit(page,form); assert.equal(failed.status(),503); await uncertain(form);
    assert.equal(await page.evaluate(()=>LanderMeasurement.getSnapshot().filter(e=>e.event==='commercial_request_saved').length),0);
    await mode('normal'); await submit(page,form); await success(form);
    const events=await page.evaluate(()=>LanderMeasurement.getSnapshot()); const saved=events.filter(e=>e.event==='commercial_request_saved'); assert.equal(saved.length,1);
    const serialized=JSON.stringify(events); assert(!serialized.includes(email)&&!serialized.includes(name)&&!serialized.includes('@'));
    const forbidden=['email','name','receipt','intent','message','request_id']; for(const key of forbidden) assert(!Object.hasOwn(saved[0],key));
    assert.equal(saved[0].profile,'varejo'); assert.equal(saved[0].source,'instagram');
    await verifyNoLeaks(state); await instance.close();
    return {savedEventCount:1,failedEventCount:0,forgedConfirmationRejected:true,event:saved[0],livePanelReceipt:'not tested'};
  });
  for(const profile of ['varejo','atacado']) await runCase('hero-measurement-'+profile,async()=>{
    const state=await context(390); const {page,instance}=state; const events=[];
    await page.exposeFunction('recordSyntheticMeasurement',event=>events.push(event));
    await page.addInitScript(()=>window.addEventListener('lander:measurement',event=>window.recordSyntheticMeasurement(event.detail)));
    await page.goto(host+'/?utm_source=ig&utm_medium=social&utm_campaign=lr-261122',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Permitir medição',exact:true}).click();
    await page.locator('.hero-cta[data-profile="'+profile+'"]').click(); await page.waitForURL(host+'/'+profile+'/');
    await page.waitForTimeout(150);
    const expected=profile==='varejo'?'retail_selected':'wholesale_selected';
    assert.equal(events.filter(e=>e.event===expected).length,1); assert.equal(events.filter(e=>e.event==='whatsapp_open_click').length,0);
    await verifyNoLeaks(state); await instance.close();
    return {profile,selectionEvent:expected,selectionCount:1,whatsappOpenCount:0};
  });
  await mode('normal'); persist({passed:results.length,failed:0});
  console.log(JSON.stringify({run,passed:results.length,failed:0,evidence:out}));
})().catch(async error=>{
  try {if(activePage&&!activePage.isClosed()) await activePage.screenshot({path:path.join(out,'failure.png'),fullPage:true});} catch{}
  persist({passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,error:error.message});
  console.error(error.stack); process.exitCode=1;
}).finally(async()=>{if(browser) await browser.close();});
