'use client';
import {useState} from 'react';
export default function PortfolioImport({onComplete}:{onComplete:()=>void}){
 const [publish,setPublish]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function submit(){setBusy(true);setMessage('');try{const response=await fetch('/api/admin/portfolio/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmation:'IMPORT_APPROVED_PORTFOLIO',publish})});const data=await response.json();if(!response.ok)throw Error(data.error);setMessage(data.inserted+' projects imported as '+data.status+'. Existing records were preserved.');onComplete();}catch(error){setMessage(error instanceof Error?error.message:'Import failed');}finally{setBusy(false);}}
 return <details className="cms-design-panel"><summary>Import the approved portfolio</summary><p>38 projects from the latest supplied list. Existing entries are preserved. Drafts remain private.</p><label className="cms-builder-checkbox"><input type="checkbox" checked={publish} onChange={event=>setPublish(event.target.checked)}/>Publish the approved catalog (publishing permission required)</label><button type="button" disabled={busy} onClick={()=>void submit()}>{busy?'Importing…':'Import missing projects'}</button>{message&&<p role="status">{message}</p>}</details>;
}
