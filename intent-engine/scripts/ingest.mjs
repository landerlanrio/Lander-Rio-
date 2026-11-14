import fs from 'node:fs';
import { toSnapshot } from '../lib/ingestion.mjs';
const base=new URL('../',import.meta.url);
const input=process.argv[2]||new URL('data/openseo-latest.json',base);
// Validate completely before replacing any prior good output. Never log source data or credentials.
try {
 const envelope=JSON.parse(fs.readFileSync(input,'utf8')), snapshot=toSnapshot(envelope);
 const dest=new URL('data/observacoes.json',base), tmp=new URL('data/observacoes.json.tmp',base);
 let prior;try{prior=JSON.parse(fs.readFileSync(dest,'utf8'));}catch{}
 if(prior?.captura && Date.parse(snapshot.captura)<Date.parse(prior.captura)) throw Error('Captura antiga rejeitada');
 if(prior?.dataHash===snapshot.dataHash&&prior?.captura===snapshot.captura){console.log('Ingestão idempotente: nenhuma alteração');process.exit(0);}
 fs.writeFileSync(tmp,JSON.stringify(snapshot,null,2)+'\n',{mode:0o600});fs.renameSync(tmp,dest);
 console.log(JSON.stringify({status:'ok',rows:snapshot.paginas.length,period:[snapshot.periodo_inicio,snapshot.periodo_fim],hash:snapshot.dataHash}));
}catch(error){console.error('Ingestão rejeitada: '+error.message);process.exitCode=1;}
