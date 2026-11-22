// Isolated QA only. Production uses the Supabase RPC adapter.
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { CaptureError } from './core.mjs';
export class SQLiteStore{
 constructor(filename){
  this.db=new DatabaseSync(filename);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
  CREATE TABLE IF NOT EXISTS commercial_requests(request_id TEXT PRIMARY KEY,fingerprint TEXT NOT NULL,receipt TEXT UNIQUE NOT NULL,payload TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,crm_status TEXT NOT NULL DEFAULT 'pending',crm_contact_id TEXT,claim_token TEXT,claim_until INTEGER,last_error TEXT);`);
 }
 async save(record){
  const receipt='LR-'+record.request_id.replaceAll('-','').toUpperCase();
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const old=this.db.prepare('SELECT * FROM commercial_requests WHERE request_id=?').get(record.request_id);
   if(old){if(old.fingerprint!==record.fingerprint)throw new CaptureError('idempotency_conflict',409);this.db.exec('COMMIT');return {saved:true,receipt:old.receipt,crm_status:old.crm_status,duplicate:true};}
   this.db.prepare('INSERT INTO commercial_requests(request_id,fingerprint,receipt,payload) VALUES(?,?,?,?)').run(record.request_id,record.fingerprint,receipt,JSON.stringify(record));
   this.db.exec('COMMIT');return {saved:true,receipt,crm_status:'pending',duplicate:false};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 list(){return this.db.prepare('SELECT * FROM commercial_requests ORDER BY created_at,request_id').all().map(r=>({...r,...JSON.parse(r.payload),payload:undefined}));}
 async claim(){
  const token=randomUUID(),now=Date.now();
  const r=this.db.prepare("UPDATE commercial_requests SET claim_token=?,claim_until=? WHERE request_id=(SELECT request_id FROM commercial_requests WHERE crm_status='pending' AND (claim_until IS NULL OR claim_until<?) ORDER BY created_at LIMIT 1) RETURNING *").get(token,now+60000,now);
  return r?{...JSON.parse(r.payload),claim_token:token}:null;
 }
 async finish(request_id,token,contact_id){return this.db.prepare("UPDATE commercial_requests SET crm_status='synced',crm_contact_id=?,claim_token=NULL,claim_until=NULL,last_error=NULL WHERE request_id=? AND claim_token=?").run(contact_id,request_id,token).changes===1;}
 async release(request_id,token){this.db.prepare("UPDATE commercial_requests SET claim_token=NULL,claim_until=NULL,last_error='crm_unavailable' WHERE request_id=? AND claim_token=?").run(request_id,token);}
 close(){this.db.close();}
}
