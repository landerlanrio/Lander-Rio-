// Produces a deploy request with source code/public project ID only; no credential values.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const files=[];
for(const [name,path] of [['index.ts','supabase/functions/commercial-capture-hml/index.ts'],['staging-edge.mjs','commercial-capture/staging-edge.mjs'],['core.mjs','commercial-capture/core.mjs'],['supabase-store.mjs','commercial-capture/supabase-store.mjs']])files.push({name,content:await readFile(resolve(root,path),'utf8')});
const payload={project_id:'riplqdzgwlggvhbznovm',name:'commercial-capture-hml',entrypoint_path:'index.ts',verify_jwt:true,files};
const out=resolve(process.argv[2]||'/tmp/lander-commercial-edge-payload.json');await writeFile(out,JSON.stringify(payload,null,2)+'\n');console.log('Staging-only deployment source payload prepared: '+out);
