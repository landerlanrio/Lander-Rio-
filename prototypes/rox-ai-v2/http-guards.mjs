// Shared, bounded safeguards. The in-memory limiter is defense in depth only.
export async function readBoundedBody(request, maxBytes=18000) {
 const length=Number(request.headers.get('content-length')||0);
 if(length>maxBytes)throw new RangeError('request_too_large');
 if(!request.body)return '';
 const reader=request.body.getReader();const chunks=[];let bytes=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>maxBytes){await reader.cancel();throw new RangeError('request_too_large');}chunks.push(value);}}
 finally{reader.releaseLock();}
 const all=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.byteLength;}
 return new TextDecoder('utf-8',{fatal:true}).decode(all);
}
export function createLimiter({limit=5,windowMs=60000,maxKeys=1200,now=Date.now}={}) {
 const records=new Map();
 function limited(key){
  const time=now();let row=records.get(key);
  if(row&&row.until>time){if(row.count>=limit)return true;row.count++;return false;}
  for(const [k,v] of records)if(v.until<=time)records.delete(k);
  // Fail closed for new identities when at capacity, never grow unbounded.
  if(records.size>=maxKeys)return true;
  records.set(key,{count:1,until:time+windowMs});return false;
 }
 return {limited,size:()=>records.size};
}
