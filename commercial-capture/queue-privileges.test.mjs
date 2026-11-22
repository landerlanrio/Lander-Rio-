// Opt-in isolated PostgreSQL regression; never calls a hosted database or tests deletion of a row.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {normalize} from './core.mjs';
const container=process.env.LR_CAPTURE_POSTGRES_CONTAINER;
test('queue privileges override Supabase default ALL and repair existing grants without losing RPC access',{skip:!container},async()=>{
 const database='lr_acl_qa_'+randomUUID().replaceAll('-','');
 function sql(query,db=database){return new Promise((ok,bad)=>{const c=spawn('docker',['exec','-i',container,'psql','-U','postgres','-d',db,'-qAt','-v','ON_ERROR_STOP=1']);let out='',err='';c.stdout.on('data',x=>out+=x);c.stderr.on('data',x=>err+=x);c.on('error',bad);c.on('close',n=>n?bad(Error(err)):ok(out.trim()));c.stdin.end(query);});}
 const privileges=table=>sql(`select jsonb_object_agg(p,has_table_privilege('service_role','public.${table}',p)) from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p`).then(JSON.parse);
 const least={SELECT:true,INSERT:true,UPDATE:true,DELETE:false,TRUNCATE:false,REFERENCES:false,TRIGGER:false,MAINTAIN:false};
 const record=()=>normalize({request_id:randomUUID(),profile:'varejo',intent:'envio',email:'acl-canary@example.test',origin:{entry_path:'/',page_path:'/varejo/'},privacy_ack:true});
 const capture=r=>sql(`set role service_role; select public.capture_commercial_request('${JSON.stringify(r)}'::jsonb);`).then(JSON.parse);
 const claim=()=>sql('set role service_role; select public.claim_commercial_request();').then(JSON.parse);
 const release=r=>sql(`set role service_role; select public.release_commercial_request('${r.request_id}','${r.claim_token}');`);
 const finish=r=>sql(`set role service_role; select public.finish_commercial_request('${r.request_id}','${r.claim_token}','stub-acl-contact');`);
 await sql('create database '+database,'postgres');
 try{
  await sql('alter default privileges in schema public grant all on tables to service_role; create table public.default_acl_canary(marker text);');
  const canary=await privileges('default_acl_canary');assert.ok(Object.values(canary).every(Boolean));
  await sql(readFileSync(new URL('./schema-proposal.sql',import.meta.url),'utf8'));
  await sql(readFileSync(new URL('./production-rate-proposal.sql',import.meta.url),'utf8'));
  assert.deepEqual(await privileges('commercial_requests'),least);
  assert.equal((await privileges('commercial_capture_rate_limits')).DELETE,true);
  const a=record();assert.equal((await capture(a)).saved,true);const a1=await claim();await release(a1);const a2=await claim();assert.equal(await finish(a2),'t');
  const b=record();await capture(b);
  // Reproduce the pre-repair deployed ACL, without attempting DELETE/TRUNCATE of data.
  await sql('grant all on public.commercial_requests to service_role;');assert.ok(Object.values(await privileges('commercial_requests')).every(Boolean));
  const count=await sql('select count(*) from public.commercial_requests');
  await sql(readFileSync(new URL('./queue-privileges-repair.sql',import.meta.url),'utf8'));
  assert.deepEqual(await privileges('commercial_requests'),least);
  assert.equal((await privileges('commercial_capture_rate_limits')).DELETE,true);
  assert.deepEqual(await privileges('default_acl_canary'),canary);
  assert.equal(await sql('select count(*) from public.commercial_requests'),count);
  assert.equal((await capture(b)).duplicate,true);const b1=await claim();assert.equal(b1.request_id,b.request_id);await release(b1);const b2=await claim();assert.equal(await finish(b2),'t');
  const c=record();assert.equal((await capture(c)).saved,true);const c1=await claim();assert.equal(c1.request_id,c.request_id);assert.equal(await finish(c1),'t');
  assert.equal(await sql("select count(*) from public.commercial_requests where crm_status='synced'"),'3');
  assert.equal(await sql("select count(*) from pg_trigger where tgrelid='public.commercial_requests'::regclass and not tgisinternal"),'0');
  for(const role of ['anon','authenticated'])assert.equal(await sql(`select has_table_privilege('${role}','public.commercial_requests','SELECT')`),'f');
 }finally{await sql('drop database '+database,'postgres');}
});
