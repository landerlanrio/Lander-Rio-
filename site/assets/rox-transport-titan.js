/* Optional transport; absent configuration means zero requests.
 * Activation needs a reviewed same-origin backend, explicit session consent
 * and a real challenge token provider. No token or endpoint is bundled here.
 */
(()=>{'use strict';
 function create({endpoint,consent,challenge,fetcher=window.fetch?.bind(window),timeoutMs=18000}={}){
  if(endpoint!=='/api/rox/chat'||typeof consent!=='function'||typeof challenge!=='function'||typeof fetcher!=='function')return null;
  let pending=false;
  return Object.freeze({enabled:true,async ask(message,history=[]){
   if(pending||consent()!==true)return null;
   if(typeof message!=='string'||!message.trim()||message.length>700)return null;
   pending=true;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
   try{
    const turnstileToken=await challenge();if(typeof turnstileToken!=='string'||!turnstileToken||turnstileToken.length>2100||controller.signal.aborted)return null;
    const safeHistory=Array.isArray(history)?history.slice(-4).filter(m=>m.role==='user'&&typeof m.content==='string'&&m.content.length<100):[];
    const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[...safeHistory,{role:'user',content:message}],turnstileToken}),credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
    if(!response.ok)return null;
    const data=await response.json();
    if(!data||!['answer','offline','unknown','clinical','privacy'].includes(data.mode)||typeof data.reply!=='string'||!data.reply||data.reply.length>1000)return null;
    // Remote output cannot create sales links or inject HTML.
    return {mode:data.mode,reply:data.reply};
   }catch{return null}finally{clearTimeout(timer);pending=false}
  }});
 }
 window.LanderRoxTransportFactory=Object.freeze({create});
})();
