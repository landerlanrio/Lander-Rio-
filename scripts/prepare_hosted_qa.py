#!/usr/bin/env python3
"""Prepare a pinned, isolated Netlify QA tree. Never reads credentials or deploys."""
from pathlib import Path, PurePosixPath
from io import BytesIO
import argparse, hashlib, json, re, subprocess, tarfile
from urllib.parse import urlsplit

BASE='bf22cf4575929530359cce74fefd7669a5794c65'
SITE_ID='3075d60e-df1e-4664-b5c5-9fbd3a189dc3'
ORIGIN='https://lander-rio-commercial-hml-20261122.netlify.app'
EDGE='https://riplqdzgwlggvhbznovm.supabase.co/functions/v1/commercial-capture-hml'
ROOT=Path(__file__).resolve().parents[1]

def sha(data):return hashlib.sha256(data).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--out',type=Path,default=Path('/workspace/lander-hosted-qa-v2'));p.add_argument('--source-commit',default=BASE);args=p.parse_args()
 out=args.out.resolve()
 if out.exists() and any(out.iterdir()):raise SystemExit('Refusing a nonempty output directory: '+str(out))
 if out==ROOT or ROOT.is_relative_to(out):raise SystemExit('Output must be independent of the source repository')
 commit=subprocess.check_output(['git','rev-parse',args.source_commit+'^{commit}'],cwd=ROOT,text=True).strip()
 source=subprocess.check_output(['git','archive','--format=tar',commit],cwd=ROOT)
 out.mkdir(parents=True,exist_ok=True);before={}
 with tarfile.open(fileobj=BytesIO(source)) as archive:
  for m in archive.getmembers():
   rel=PurePosixPath(m.name)
   if rel.is_absolute() or '..' in rel.parts or m.issym() or m.islnk():raise SystemExit('Unsafe archive entry')
   target=out/str(rel)
   if m.isdir():target.mkdir(parents=True,exist_ok=True);continue
   if not m.isfile():raise SystemExit('Unexpected archive entry type')
   data=archive.extractfile(m).read();target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data);target.chmod(m.mode&0o777);before[str(rel)]=sha(data)
 config='''"$schema" = "https://open-api.netlify.com/netlify.schema.json"
# ISOLATED QA ONLY. No build hook, deploy command, credentials or production proxy.
[build]
  publish = "site"
  command = ""
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
'''
 (out/'netlify.toml').write_text(config)
 (out/'site/netlify.toml').write_text('''[build]
  publish = "."
  command = ""
# Static QA copy only. Runtime routing is configured at the deployment root.
''')
 hp=out/'site/_headers';headers=hp.read_text();headers=headers.replace('/*\n','/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n',1)
 headers=re.sub(r'^  Content-Security-Policy:.*$',"  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self' https://wa.me; upgrade-insecure-requests",headers,flags=re.M)
 headers=re.sub(r'^  Referrer-Policy:.*$','  Referrer-Policy: no-referrer',headers,flags=re.M);hp.write_text(headers)
 (out/'site/robots.txt').write_text('User-agent: *\nDisallow: /\n')
 rp=out/'site/_redirects';lines=rp.read_text().splitlines();removed=[line for line in lines if line.startswith('/api/')]
 if len(removed)!=3 or any('https://artcokrtuqppgtawuczq.supabase.co/' not in line for line in removed):raise SystemExit('Unexpected source API proxy inventory; review before packaging')
 rp.write_text('# QA: commercial routes are functions; every other API route is disabled.\n'+'\n'.join(line for line in lines if line not in removed)+'\n')
 # The QA copy has no direct-RPC fallback even if someone configures unrelated credentials.
 lead=out/'netlify/functions/commercial-lead.mjs'
 lead.write_text('''import {createEdgeBridge} from '../../commercial-capture/edge-bridge.mjs';
export default async request=>{
 try{
  if(Netlify.env.get('COMMERCIAL_EDGE_ENVIRONMENT')!=='isolated-staging'||Netlify.env.get('COMMERCIAL_SUPABASE_URL')||Netlify.env.get('COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY')||Netlify.env.get('COMMERCIAL_DIRECT_FIXTURE'))throw Error('isolated_qa_configuration_required');
  return await createEdgeBridge({endpoint:Netlify.env.get('COMMERCIAL_EDGE_ENDPOINT'),key:Netlify.env.get('COMMERCIAL_EDGE_ANON_KEY'),origin:Netlify.env.get('COMMERCIAL_ALLOWED_ORIGIN'),environment:'isolated-staging'})(request);
 }catch{return Response.json({ok:false,error:'temporarily_unavailable'},{status:503,headers:{'cache-control':'no-store','x-robots-tag':'noindex, nofollow, noarchive'}});}
};
export const config={path:'/api/commercial/lead',method:['POST'],rateLimit:{action:'rate_limit',aggregateBy:['domain','ip'],windowSize:60,windowLimit:10}};
''')
 health=out/'netlify/functions/commercial-health.mjs'
 health.write_text('''import {createEdgeHealth} from '../../commercial-capture/edge-bridge.mjs';
export default async request=>{
 try{
  if(Netlify.env.get('COMMERCIAL_EDGE_ENVIRONMENT')!=='isolated-staging'||Netlify.env.get('COMMERCIAL_SUPABASE_URL')||Netlify.env.get('COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY')||Netlify.env.get('COMMERCIAL_DIRECT_FIXTURE'))throw Error('isolated_qa_configuration_required');
  return await createEdgeHealth({endpoint:Netlify.env.get('COMMERCIAL_EDGE_ENDPOINT'),key:Netlify.env.get('COMMERCIAL_EDGE_ANON_KEY'),origin:Netlify.env.get('COMMERCIAL_ALLOWED_ORIGIN'),environment:'isolated-staging'})(request);
 }catch{return Response.json({ok:false,error:'temporarily_unavailable'},{status:503,headers:{'cache-control':'no-store','x-robots-tag':'noindex, nofollow, noarchive'}});}
};
export const config={path:'/api/commercial/health',method:['GET']};
''')
 deny='''// QA only. No outbound calls, credentials, form writes or production forwarding.
export default async ()=>Response.json({ok:false,error:'disabled_in_isolated_qa'},{status:503,headers:{'cache-control':'no-store','content-type':'application/json; charset=utf-8','x-robots-tag':'noindex, nofollow, noarchive'}});
'''
 (out/'netlify/functions/qa-disabled-services.mjs').write_text(deny+"export const config={path:'/api/*',excludedPath:['/api/commercial/lead','/api/commercial/health']};\n")
 (out/'netlify/functions/qa-disabled-forms.mjs').write_text(deny+"export const config={path:['/treino/','/radar-performance/recebido/'],method:['POST']};\n")
 after={p.relative_to(out).as_posix():sha(p.read_bytes()) for p in sorted(out.rglob('*')) if p.is_file()}
 changed={rel:{'source_sha256':before.get(rel),'qa_sha256':digest} for rel,digest in after.items() if before.get(rel)!=digest}
 html_unchanged=all(after.get(rel)==digest for rel,digest in before.items() if rel.startswith('site/') and rel.endswith('.html'))
 if not html_unchanged:raise SystemExit('HTML UI unexpectedly changed')
 if any('https://' in line.split()[1] for line in rp.read_text().splitlines() if line and not line.startswith('#') and len(line.split())>1):raise SystemExit('External proxy remains')
 urls=set()
 for path in (out/'site').rglob('*'):
  if path.suffix in ('.js','.html','.css','.json','.xml','.txt'):
   urls.update(re.findall(r'https?://[^\s\"\'<>`)}\\]+',path.read_text(errors='ignore')))
 hosts=sorted({urlsplit(url).hostname for url in urls if urlsplit(url).hostname})
 report={'source_commit':commit,'qa_site_id':SITE_ID,'qa_origin':ORIGIN,'qa_generation':'v2','qa_environment_enforced':'isolated-staging','published':False,'source_file_count':len(before),'qa_file_count':len(after),'html_ui_unchanged':html_unchanged,'changed_or_added':changed,'runtime_destinations':{'POST /api/commercial/lead':EDGE,'GET /api/commercial/health':EDGE+'/health','all_other_api_routes':'503 without network','POST legacy_forms':'503 without network','browser_connect_src':'self only','analytics':'production-hostname guards + QA CSP block external transport','user_initiated_external_navigation':'Approved external anchors preserved; tests must block WhatsApp/Instagram navigation and never send messages'},'required_runtime_env_names':['COMMERCIAL_ALLOWED_ORIGIN','COMMERCIAL_EDGE_ENDPOINT','COMMERCIAL_EDGE_ANON_KEY','COMMERCIAL_EDGE_ENVIRONMENT'],'required_runtime_nonsecret_values':{'COMMERCIAL_ALLOWED_ORIGIN':ORIGIN,'COMMERCIAL_EDGE_ENDPOINT':EDGE,'COMMERCIAL_EDGE_ENVIRONMENT':'isolated-staging'},'forbidden_runtime_env_names':['COMMERCIAL_SUPABASE_URL','COMMERCIAL_SUPABASE_SERVICE_ROLE_KEY','COMMERCIAL_DIRECT_FIXTURE'],'static_source_reference_hosts':hosts,'release_limits':['Tree is prepared but not deployed','QA changes intentionally do not match source production manifests','Source HTML/canonicals remain unchanged; noindex is enforced by headers and robots','Hosted route precedence and headers require read-only checks after QA deploy','Configure only isolated QA site runtime variables; no production credentials are accepted']}
 (out/'QA_PREPARATION_REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 (out/'QA_SOURCE_MANIFEST.json').write_text(json.dumps({'source_commit':commit,'files':before},indent=2)+'\n')
 (out/'QA_TREE_MANIFEST.json').write_text(json.dumps({'source_commit':commit,'files':after},indent=2)+'\n')
 (out/'QA_TREE_SHA256.txt').write_text(sha((out/'QA_TREE_MANIFEST.json').read_bytes())+'  QA_TREE_MANIFEST.json\n')
 print(json.dumps({'out':str(out),'source_commit':commit,'source_files':len(before),'qa_files':len(after),'changes':len(changed),'html_ui_unchanged':html_unchanged,'published':False},indent=2))
if __name__=='__main__':main()
