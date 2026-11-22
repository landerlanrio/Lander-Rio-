/* Local QA only. Not shipped in site/. Uses the existing API-blocking probe. */
const results=[],measurements=[],audits=[];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function check(name,passed,detail=''){results.push({name,passed,detail});document.querySelector('#results').textContent+=`${passed?'PASS':'FAIL'} ${name}${detail?' — '+detail:''}\n`;}
async function until(fn){for(let i=0;i<60;i++){if(fn())return;await pause(50)}throw Error('QA condition timed out')}
async function runDiamond(){
  results.length=0;measurements.length=0;audits.length=0;document.querySelector('#results').textContent='';document.querySelector('#runDiamond').disabled=true;
  const started=new Date().toISOString();
  try{
    for(const width of [320,390,768,1440]){
      document.querySelector('#status').textContent=`Testando ${width}px…`;
      const frame=document.createElement('iframe');frame.width=width;frame.height=844;frame.title='Validação '+width+'px';
      const ready=new Promise(resolve=>frame.onload=resolve);frame.src='/marcas/landerlan/?qa=1#diamond-gold';document.querySelector('#stage').replaceChildren(frame);await ready;
      const win=frame.contentWindow,doc=frame.contentDocument;
      await doc.fonts.ready;doc.querySelector('#diamond-gold').scrollIntoView();
      const images=[...doc.querySelectorAll('.dg-gallery img')];
      for(const image of images){image.scrollIntoView();await image.decode()}
      doc.querySelector('#diamond-gold').scrollIntoView();
      check(`Seis imagens oficiais carregadas @${width}`,images.length===6&&images.every(image=>image.naturalWidth===640&&image.naturalHeight===616&&image.alt.includes('Landerpharma')));
      check(`Embalagens sem corte visual @${width}`,images.every(image=>win.getComputedStyle(image).objectFit==='contain'&&image.clientWidth>0));
      const originals=[];
      for(const link of doc.querySelectorAll('.dg-package-image')){const img=new win.Image();img.src=link.href;await img.decode();originals.push({src:img.src,width:img.naturalWidth,height:img.naturalHeight})}
      check(`Seis ampliações locais funcionam @${width}`,originals.length===6&&new Set(originals.map(i=>i.src)).size===6&&originals.every(i=>i.width===1278&&i.height===1230));
      check(`Viewport corresponde ao teste @${width}`,win.innerWidth===width);
      check(`Página sem overflow horizontal @${width}`,doc.documentElement.scrollWidth<=win.innerWidth+1,`${doc.documentElement.scrollWidth}/${win.innerWidth}px`);
      check(`Seis referências visíveis @${width}`,doc.querySelectorAll('[data-diamond-reference]').length===6&&[...doc.querySelectorAll('[data-diamond-reference]')].every(e=>win.getComputedStyle(e).display!=='none'));
      const copy=doc.querySelector('.dg-links').getBoundingClientRect(),gallery=doc.querySelector('.dg-gallery').getBoundingClientRect(),note=doc.querySelector('.dg-art-note').getBoundingClientRect();
      check(`Texto, galeria e legenda sem sobreposição @${width}`,copy.bottom<=gallery.top&&gallery.bottom<=note.top,`${copy.bottom.toFixed(1)} <= ${gallery.top.toFixed(1)}; ${gallery.bottom.toFixed(1)} <= ${note.top.toFixed(1)}`);
      check(`Âncoras locais válidas @${width}`,[...doc.querySelectorAll('a[href^="#"]')].every(a=>doc.getElementById(a.hash.slice(1))));
      check(`Uma H1 e canonical preservado @${width}`,doc.querySelectorAll('h1').length===1&&doc.querySelector('link[rel=canonical]').href==='https://landerrio.com.br/marcas/landerlan/');
      const table=doc.querySelector('.dg-table-wrap');
      check(`Tabela contém rolagem própria @${width}`,table.clientWidth<=width&&win.getComputedStyle(table).overflowX==='auto');
      const before=table.scrollLeft;table.scrollLeft=table.scrollWidth;
      check(`Tabela alcança coluna final @${width}`,table.scrollWidth<=table.clientWidth+1||table.scrollLeft>before);
      const faq=[...doc.querySelectorAll('.ba-faq details')].find(d=>d.querySelector('summary').textContent.includes('Qual é o óleo'));
      faq.querySelector('summary').click();check(`FAQ sobre óleo abre @${width}`,faq.open&&faq.textContent.includes('outros cinco'));
      doc.querySelector('a[href="#oleo-composicao"]').click();await pause(80);
      check(`Navegação para composição @${width}`,win.location.hash==='#oleo-composicao');
      check(`Nenhum erro JS ou recurso @${width}`,!win.__qa.errors.length&&!win.__qa.resourceErrors.length,JSON.stringify(win.__qa));
      check(`Nenhum formulário enviado @${width}`,!win.__qa.requests.some(r=>r.url.startsWith('/api/')));
      const script=doc.createElement('script');script.src='/__qa/axe.min.js';const axeReady=new Promise(resolve=>script.onload=resolve);doc.head.append(script);await axeReady;
      const audit=await win.axe.run(doc,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});
      audits.push({width,violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:audit.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))});
      check(`Axe sem violações @${width}`,audit.violations.length===0,audit.violations.map(v=>v.id).join(', '));
      measurements.push({width,documentWidth:doc.documentElement.scrollWidth,heroHeight:doc.querySelector('.dg-feature').clientHeight,tableWidth:table.clientWidth,tableScrollWidth:table.scrollWidth});
    }
  }catch(error){check('Execução completa',false,String(error.stack||error));}
  const report={release:'digital-flagship-2026-rc14',revision:'editorial-section-v3',started,finished:new Date().toISOString(),engine:navigator.userAgent,scope:'Local Chromium; four CSS viewport frames; original manufacturer catalog images; no production writes or real API submissions',status:results.every(r=>r.passed)?'PASS':'FAIL',results,measurements,axe:audits};
  await fetch('/__qa/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});
  document.querySelector('#status').textContent=`${report.status} — ${results.filter(r=>r.passed).length}/${results.length} verificações. Relatório salvo.`;document.querySelector('#runDiamond').disabled=false;
}
document.querySelector('#runDiamond').addEventListener('click',runDiamond);
