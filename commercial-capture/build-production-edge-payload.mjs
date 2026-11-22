// Preparation only. Does not call any service or export runtime credentials.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),files=[];
for(const [name,path] of [['index.ts','supabase/functions/commercial-capture-entry/index.ts'],['production-edge.mjs','commercial-capture/production-edge.mjs'],['core.mjs','commercial-capture/core.mjs'],['supabase-store.mjs','commercial-capture/supabase-store.mjs']])files.push({name,content:await readFile(resolve(root,path),'utf8')});
const payload={project_id:'artcokrtuqppgtawuczq',name:'commercial-capture-entry',entrypoint_path:'index.ts',verify_jwt:true,files};
const out=resolve(process.argv[2]||'/tmp/lander-production-capture-candidate.json');await writeFile(out,JSON.stringify(payload,null,2)+'\n');console.log('Production candidate source prepared only; no deployment performed.');
