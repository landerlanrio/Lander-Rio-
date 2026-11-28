/* Test-only: intercept form submissions before application scripts run. */
window.__qa={errors:[],resourceErrors:[],requests:[],apiMode:'failure'};
addEventListener('error',e=>{if(e.message)window.__qa.errors.push(e.message)});
addEventListener('unhandledrejection',e=>window.__qa.errors.push(String(e.reason)));
const originalFetch=window.fetch.bind(window);
window.fetch=(url,options={})=>{
 const target=new URL(typeof url==='string'?url:url.url,location.href);
 if(target.pathname.startsWith('/api/')){
  window.__qa.requests.push({url:target.pathname,body:options.body});
  const mode=window.__qa.apiMode;
  if(mode==='pending') {
    return new Promise(resolve=>{
      window.__qa.finishPending=()=>resolve(new Response('{}',{status:400}));
    });
  }
  return Promise.resolve(new Response(JSON.stringify(mode==='success'?{ok:true,id:'f2a2a2a2-1234-4567-89ab-123456789abc'}:mode==='invalid'?{ok:true,id:'invalid'}:{ok:false,error:'QA simulated failure'}),{status:mode==='failure'?503:200,headers:{'Content-Type':'application/json'}}));
 }
 if(target.origin!==location.origin){window.__qa.requests.push({url:target.origin,blocked:true});return Promise.reject(new Error('QA blocks external fetch'))}
 return originalFetch(url,options);
};

addEventListener('error',e=>{if(e.target!==window&&e.target?.tagName)window.__qa.resourceErrors.push({tag:e.target.tagName,url:e.target.currentSrc||e.target.src||e.target.href})},true);
