// Opt-in isolated PostgreSQL integration suite; never uses hosted credentials.
import {test,before,after} from 'node:test';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {normalize} from './core.mjs';
const container=process.env.LR_CAPTURE_POSTGRES_CONTAINER;
const database='lr_capture_qa_'+randomUUID().replaceAll('-','');
function sql(query,db=database){return new Promise((resolve,reject)=>{const c=spawn('docker',['exec','-i',container,'psql','-U','postgres','-d',db,'-qAt','-v','ON_ERROR_STOP=1']);let out='',err='';c.stdout.on('data',d=>out+=d);c.stderr.on('data',d=>err+=d);c.on('error',reject);c.on('close',code=>code?reject(Error(err)):resolve(out.trim()));c.stdin.end(query);});}
before(async()=>{if(!container)return;await sql('create database '+database,'postgres');await sql(readFileSync(new URL('./schema-proposal.sql',import.meta.url),'utf8'));await sql(readFileSync(new URL('./staging-rate-proposal.sql',import.meta.url),'utf8'));await sql(readFileSync(new URL('./production-rate-proposal.sql',import.meta.url),'utf8'));});
after(async()=>{if(container)await sql('drop database if exists '+database,'postgres');});
const value=()=>normalize({request_id:randomUUID(),profile:'atacado',intent:'envio',email:'pg-qa@example.test',name:'Ficticio',origin:{entry_path:'/',page_path:'/atacado/',utm_source:'instagram'},privacy_ack:true});
const capture=d=>`set role service_role; select public.capture_commercial_request('${JSON.stringify(d)}'::jsonb);`;
test('Postgres atomic capture handles concurrent retries, conflict, and role isolation',{skip:!container},async()=>{
 const d=value();const rs=await Promise.all(Array.from({length:8},()=>sql(capture(d)).then(x=>JSON.parse(x.split('\n').at(-1)))));assert.equal(rs.filter(x=>x.duplicate===false).length,1);assert.equal(rs.filter(x=>x.duplicate===true).length,7);assert.equal(await sql(`select count(*) from public.commercial_requests where request_id='${d.request_id}'`),'1');
 const {fingerprint,...original}=d;const conflict=normalize({...original,intent:'suporte'});await assert.rejects(()=>sql(capture(conflict)),/idempotency_conflict/);
 assert.equal(await sql(`select intent from public.commercial_requests where request_id='${d.request_id}'`),'envio');
 await assert.rejects(()=>sql('set role anon; select * from public.commercial_requests;'),/permission denied/);
 await assert.rejects(()=>sql(capture(d).replace('set role service_role','set role authenticated')),/permission denied/);
});
test('Postgres lease claims, outage release, expiry and CRM receipt persist',{skip:!container},async()=>{
 await sql('truncate public.commercial_requests;');const d=value();await sql(capture(d));
 const claim=async()=>JSON.parse((await sql("set role service_role; select coalesce(public.claim_commercial_request(),'null'::jsonb);")).split('\n').at(-1));
 const claims=await Promise.all([claim(),claim()]);assert.equal(claims.filter(Boolean).length,1);const first=claims.find(Boolean);
 await sql(`set role service_role; select public.release_commercial_request('${d.request_id}','${first.claim_token}');`);
 const second=await claim();assert.notEqual(second.claim_token,first.claim_token);
 await sql(`update public.commercial_requests set claim_until=now()-interval '1 minute' where request_id='${d.request_id}';`);const third=await claim();
 assert.equal((await sql(`set role service_role; select public.finish_commercial_request('${d.request_id}','${second.claim_token}','stale');`)).split('\n').at(-1),'f');
 assert.equal((await sql(`set role service_role; select public.finish_commercial_request('${d.request_id}','${third.claim_token}','synthetic-contact-pg');`)).split('\n').at(-1),'t');
 assert.equal(await sql(`select crm_status||':'||crm_contact_id from public.commercial_requests where request_id='${d.request_id}'`),'synced:synthetic-contact-pg');
 assert.equal(await claim(),null);
});

test('Postgres staging rate limiter is durable, atomic and unavailable to anonymous callers',{skip:!container},async()=>{
 const second=new Date().getUTCSeconds();if(second>56)await new Promise(r=>setTimeout(r,(61-second)*1000));
 const key='a'.repeat(64),call=()=>sql("set role service_role; select public.allow_commercial_staging_request('"+key+"');").then(JSON.parse);
 const responses=await Promise.all(Array.from({length:16},call));assert.equal(responses.filter(r=>r.allowed).length,10);assert.equal(responses.filter(r=>!r.allowed).length,6);
 await assert.rejects(()=>sql("set role anon; select public.allow_commercial_staging_request('"+key+"');"),/permission denied/);
 await sql('truncate public.commercial_staging_rate_limits');
 const allowed=await sql("set role service_role; select count(*) filter(where (public.allow_commercial_staging_request(md5(s::text)||md5('synthetic-'||s::text))->>'allowed')::boolean) from generate_series(1,125) s;");assert.equal(allowed,'120');
 assert.equal(await sql('select count(*) from public.commercial_staging_rate_limits'),'121');
});

test('Postgres production secondary rate policy uses its own table and leaves requests intact',{skip:!container},async()=>{
 const second=new Date().getUTCSeconds();if(second>55)await new Promise(r=>setTimeout(r,(61-second)*1000));
 const beforeCount=await sql('select count(*) from public.commercial_requests');
 const result=await sql("set role service_role; select count(*) filter(where (public.allow_commercial_capture_request(repeat('b',64))->>'allowed')::boolean) from generate_series(1,40);");assert.equal(result,'30');
 await sql('truncate public.commercial_capture_rate_limits');
 const global=await sql("set role service_role; select count(*) filter(where (public.allow_commercial_capture_request(md5(s::text)||md5('synthetic-'||s::text))->>'allowed')::boolean) from generate_series(1,125) s;");assert.equal(global,'120');
 assert.equal(await sql('select count(*) from public.commercial_requests'),beforeCount);
 await assert.rejects(()=>sql("set role anon; select public.allow_commercial_capture_request(repeat('b',64));"),/permission denied/);
});
