(function(){
'use strict';
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
const shareStatus=document.getElementById('lr-share-status');
function feedback(message){if(shareStatus){shareStatus.textContent=message;}}
async function shareLink(url,title){
 try{
  if(navigator.share){await navigator.share({title:title,url:url});return;}
  if(navigator.clipboard && navigator.clipboard.writeText){await navigator.clipboard.writeText(url);feedback('Link copiado. Compartilhe com quem quiser.');return;}
 }catch(e){if(e && e.name==='AbortError') return;}
 // Secure clipboard is unavailable on some local previews.
 const field=document.createElement('input');field.type='text';field.value=url;field.setAttribute('aria-label','Link para copiar');
 field.style.cssText='position:fixed;left:10px;bottom:10px;z-index:1000;width:min(90vw,550px);height:42px;padding:10px;border:2px solid #b7f25b;background:#101410;color:white';
 document.body.append(field);field.focus();field.select();feedback('Selecione e copie o link exibido na parte inferior.');
 field.addEventListener('blur',()=>field.remove(),{once:true});
}
const shareSearch=document.getElementById('lr-share-search');
if(shareSearch){shareSearch.addEventListener('click',()=>{
 const u=new URL(location.pathname,location.origin);const search=document.getElementById('search');const category=document.getElementById('selector');const source=document.getElementById('lr-origin-filter');
 if(search&&search.value.trim())u.searchParams.set('q',search.value.trim());
 if(category&&category.value!=='Todos')u.searchParams.set('categoria',category.value);
 if(source&&source.value!=='todos')u.searchParams.set('origem',source.value);
 shareLink(u.href,'LANDER RIO — pesquisa na enciclopédia');
});}
const shareComparison=document.getElementById('lr-share-comparison');
if(shareComparison){shareComparison.addEventListener('click',()=>{
 const selected=(document.getElementById('compare-dock')?.dataset.selected||'').split(',').filter(Boolean).slice(0,2);
 if(selected.length!==2){feedback('Selecione duas substâncias antes de compartilhar.');return;}
 const u=new URL(location.pathname,location.origin);u.searchParams.set('compare',selected.join(','));
 shareLink(u.href,'LANDER RIO — comparação científica');
});}
const shareArticle=document.getElementById('lr-share-article');
if(shareArticle){shareArticle.addEventListener('click',()=>shareLink(location.href,document.title));}
const progress=document.getElementById('lr-read-progress');
if(progress){let scheduled=false;const update=()=>{
 scheduled=false;const scrollMax=Math.max(1,document.documentElement.scrollHeight-innerHeight);const pct=Math.max(0,Math.min(100,(scrollY/scrollMax)*100));
 progress.style.width=pct.toFixed(1)+'%';
 };addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();}
})();