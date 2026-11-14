import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const target=process.argv[2];if(!target)throw Error('Informe a cópia local do diretório site/ RC9');
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(sha(path.join(target,'assets/measurement-v23-2.js'))!=='30728ab02ddd1f04df2d0accd5f7c69ceb4d862e454cd4798f563cec8379939f')throw Error('Baseline de medição divergente: revisar antes de modificar');
const headers=path.join(target,'_headers'),original=fs.readFileSync(headers,'utf8');
if(sha(headers)!=='04c54d4f90ae5c2521dd3760e0e602f25550c796e9168c51015ffbfceb47f7dd'&&!original.includes('https://www.google-analytics.com'))throw Error('Baseline CSP divergente');
const base=new URL('../integration/',import.meta.url);
for(const file of ['ga4-config.js','ga4-intent.js'])fs.copyFileSync(new URL(file,base),path.join(target,'assets',file));
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);}
let count=0;
for(const file of walk(target).filter(x=>x.endsWith('.html'))){let html=fs.readFileSync(file,'utf8');if(html.includes('/assets/ga4-intent.js'))continue;const pattern=/<script\b[^>]*src=["']\/assets\/measurement-v23-2\.js["'][^>]*><\/script>/i;if(!pattern.test(html))continue;html=html.replace(pattern,'$&\n<script defer src="/assets/ga4-config.js"></script>\n<script defer src="/assets/ga4-intent.js"></script>');fs.writeFileSync(file,html);count++;}
if(!original.includes('https://www.google-analytics.com'))fs.writeFileSync(headers,original.replace("script-src 'self';","script-src 'self' https://www.googletagmanager.com;").replace("img-src 'self' data:;","img-src 'self' data: https://www.google-analytics.com https://region1.google-analytics.com;").replace("connect-src 'self' https://us.i.posthog.com;","connect-src 'self' https://us.i.posthog.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com;"));
console.log(JSON.stringify({patchedPages:count,activation:false,productionChanged:false}));
