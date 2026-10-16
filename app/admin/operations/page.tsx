'use client';
import Link from 'next/link';
import {useCallback,useEffect,useState} from 'react';
type Session={id:string;created_at:string;last_seen_at:string|null;expires_at:string;is_current:boolean};
type Event={id:string;action:string;module:string;target_id?:string;created_at:string;display_name?:string};
type Backup={id:string;status:string;backup_type:string;message?:string;started_at:string};
const stamp=(v:string|null|undefined)=>v?new Date(v).toLocaleString():'Not recorded';
export default function Operations(){
 const [verifyStatus,setVerifyStatus]=useState('');const [sessions,setSessions]=useState<Session[]>([]);const [events,setEvents]=useState<Event[]>([]);const [backups,setBackups]=useState<Backup[]>([]);const [isSuper,setIsSuper]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);const [auditDenied,setAuditDenied]=useState(false);
 const refresh=useCallback(async()=>{setError('');try{
  const [s,a,b]=await Promise.all([fetch('/api/admin/security/sessions',{cache:'no-store'}),fetch('/api/admin/audit?limit=60',{cache:'no-store'}),fetch('/api/admin/backups',{cache:'no-store'})]);
  if(!s.ok)throw Error((await s.json()).error||'Cannot load sessions');setSessions((await s.json()).sessions||[]);
  if(a.ok){setEvents((await a.json()).events||[]);setAuditDenied(false)}else setAuditDenied(true);
  if(b.ok){const data=await b.json();setBackups(data.events||[]);setIsSuper(!!data.exportAvailable)}
 }catch(e){setError(e instanceof Error?e.message:'Unable to load operations')}},[]);
 useEffect(()=>{void refresh()},[refresh]);
 async function revoke(id?:string){setBusy(true);setError('');setNotice('');try{const r=await fetch('/api/admin/security/sessions',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify(id?{id}:{allOthers:true})});const j=await r.json();if(!r.ok)throw Error(j.error||'Revoke failed');setNotice('Session access revoked');await refresh()}catch(e){setError(e instanceof Error?e.message:'Revoke failed')}finally{setBusy(false)}}
 async function verifyExport(file:File){
  setVerifyStatus('Verifying file integrity…');
  try{
   if(file.size>100*1024*1024)throw Error('File exceeds the 100 MB browser verification limit');
   const payload=JSON.parse(await file.text()) as {format?:string;tables?:Record<string,unknown>;counts?:Record<string,number>;checksums?:Record<string,string>};
   const keys=['pages','page_sections','services','projects','blog_posts','global_settings','inquiries','media_assets','redirects'];
   if(payload.format!=='VELAUR-CONTENT-EXPORT-v2'||!payload.tables||!payload.counts||!payload.checksums||Object.keys(payload.tables).length!==keys.length)throw Error('Unrecognized or incomplete content export');
   for(const key of keys){
    const rows=payload.tables[key];if(!Array.isArray(rows)||rows.length!==payload.counts[key])throw Error(`${key}: row count mismatch`);
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(rows)));
    const calculated=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    if(calculated!==payload.checksums[key])throw Error(`${key}: SHA-256 checksum mismatch`);
   }
   setVerifyStatus('Verified: all 9 table counts and SHA-256 checksums match. This does not confirm database restorability.');
  }catch(error){setVerifyStatus(`Verification failed: ${error instanceof Error?error.message:'Invalid export file'}`)}
 }
 async function exportData(){if(!window.confirm('Export may contain visitor inquiry personal data. Store the file securely. Continue?'))return;setBusy(true);setError('');try{const r=await fetch('/api/admin/backups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmation:'EXPORT'})});if(!r.ok){const j=await r.json();throw Error(j.error||'Export failed')}const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`velaur-content-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);setNotice('Content export downloaded. Keep it in encrypted storage.');await refresh()}catch(e){setError(e instanceof Error?e.message:'Export failed')}finally{setBusy(false)}}
 return <main className="cms-workspace"><div className="cms-top"><Link href="/admin">← Dashboard</Link><h1>Security, Audit & Exports</h1><p>Review signed-in sessions, administrative activity and content export records. Database disaster recovery must still be configured separately with Neon.</p></div>
 {error&&<p role="alert" className="cms-error">{error}</p>}{notice&&<p role="status" className="cms-success">{notice}</p>}
 <section className="cms-editor settings-editor"><h2>Active sessions</h2><p>Revoke devices you no longer recognize. The current device cannot be revoked here; use Sign out.</p><button disabled={busy} onClick={()=>void revoke()}>Sign out other devices</button><div className="admin-ops-list">{sessions.map(s=><div className="admin-ops-item" key={s.id}><div><strong>{s.is_current?'This device':'Other device'}</strong><small>Started {stamp(s.created_at)} · Last active {stamp(s.last_seen_at)} · Expires {stamp(s.expires_at)}</small></div>{!s.is_current&&<button disabled={busy} onClick={()=>void revoke(s.id)}>Revoke</button>}</div>)}{!sessions.length&&<p>No active sessions found.</p>}</div></section>
 <section className="cms-editor settings-editor"><h2>Audit log</h2>{auditDenied?<p>Only administrators with Audit VIEW permission can access activity logs.</p>:<div className="admin-ops-list">{events.map(e=><div className="admin-ops-item" key={e.id}><div><strong>{e.action} · {e.module}</strong><small>{e.display_name||'Administrator'} · {stamp(e.created_at)} {e.target_id?' · '+e.target_id:''}</small></div></div>)}{!events.length&&<p>No audit activity recorded.</p>}</div>}</section>
 <section className="cms-editor settings-editor"><h2>Data exports</h2><p>Manual JSON exports include site content and inquiries. They exclude account passwords and sessions. This is <strong>not</strong> a point-in-time database backup or automatic restore system.</p>{isSuper&&<button disabled={busy} onClick={()=>void exportData()}>Export website content JSON</button>}<div className="admin-export-verify"><label htmlFor="verify-content-file">Verify an exported JSON file (local, not uploaded)</label><input id="verify-content-file" type="file" accept="application/json,.json" onChange={event=>{const file=event.target.files?.[0];if(file)void verifyExport(file);event.target.value='';}} />{verifyStatus&&<p role="status">{verifyStatus}</p>}</div><div className="admin-ops-list">{backups.map(b=><div key={b.id} className="admin-ops-item"><div><strong>{b.backup_type} · {b.status}</strong><small>{stamp(b.started_at)} · {b.message||'No details'}</small></div></div>)}{!backups.length&&<p>No export/backup events logged.</p>}</div></section>
 </main>
}
