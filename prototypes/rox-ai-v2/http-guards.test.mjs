import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readBoundedBody,createLimiter} from './http-guards.mjs';
test('body limit counts UTF-8 bytes, not characters or declared length',async()=>{
 const request=new Request('https://local.test/chat',{method:'POST',body:'é'.repeat(10)});
 await assert.rejects(readBoundedBody(request,12),/request_too_large/);
 assert.equal(await readBoundedBody(new Request('https://local.test',{method:'POST',body:'olá'}),4),'olá');
});
test('chunked body is cancelled before accumulating beyond budget',async()=>{
 let cancelled=false;
 const body=new ReadableStream({pull(c){c.enqueue(new Uint8Array(9))},cancel(){cancelled=true}});
 await assert.rejects(readBoundedBody(new Request('https://local.test',{method:'POST',body,duplex:'half'}),10),/request_too_large/);
 assert.equal(cancelled,true);
});
test('rate limiter is bounded even while all buckets are live; expiry recovers',()=>{
 let now=0;const limiter=createLimiter({limit:2,maxKeys:2,windowMs:100,now:()=>now});
 assert.equal(limiter.limited('a'),false);assert.equal(limiter.limited('a'),false);assert.equal(limiter.limited('a'),true);
 assert.equal(limiter.limited('b'),false);assert.equal(limiter.limited('c'),true);assert.equal(limiter.size(),2);
 now=101;assert.equal(limiter.limited('c'),false);assert.equal(limiter.size(),1);
});
