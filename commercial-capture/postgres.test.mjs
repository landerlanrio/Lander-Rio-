// Opt-in isolated PostgreSQL integration suite; never uses hosted credentials.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {normalize} from './core.mjs';
const container=process.env.LR_CAPTURE_POSTGRES_CONTAINER;
function sql(query){return new Promise((resolve,reject)=>{const c=spawn('docker',['exec','-i',container,'psql','-U','postgres','-qAt','-v','ON_ERROR_STOP=1']);let out='',err='';c.stdout.on('data',d=>out+=d);c.stderr.on('data',d=>err+=d);c.on('error',reject);c.on('close',code=>code?reject(Error(err)):resolve(out.trim()));c.stdin.end(query);});}
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
