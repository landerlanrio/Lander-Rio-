import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createSupabaseStore} from './supabase-store.mjs';
test('PostgREST void release accepts HTTP204 without parsing an absent JSON body',async()=>{
 const request_id=randomUUID(),token=randomUUID();let call;
 const store=createSupabaseStore({url:'https://synthetic.supabase.co',key:'synthetic-local-only',fetchImpl:async(url,options)=>{call={url,body:JSON.parse(options.body)};return new Response(null,{status:204});}});
 assert.equal(await store.release(request_id,token),null);
 assert.equal(call.url,'https://synthetic.supabase.co/rest/v1/rpc/release_commercial_request');
 assert.deepEqual(call.body,{p_request_id:request_id,p_token:token});
});
