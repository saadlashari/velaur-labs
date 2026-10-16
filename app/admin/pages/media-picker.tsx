'use client';
import {useEffect, useRef, useState} from 'react';
import {Image as ImageIcon, X, RefreshCw, UploadCloud} from 'lucide-react';

type Asset={id:string;original_name:string;public_url:string|null;alt_text:string|null};
type Props={onSelect:(asset:{url:string;alt:string})=>void};
const formats=['image/jpeg','image/png','image/webp','image/avif'];
/** Authenticated picker with an optional upload directly into the existing Media Library. */
export function MediaPicker({onSelect}:Props){
 const [open,setOpen]=useState(false),[assets,setAssets]=useState<Asset[]>([]),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[error,setError]=useState(''),[search,setSearch]=useState(''),[alt,setAlt]=useState(''),[file,setFile]=useState<File|null>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const [cropAspect,setCropAspect]=useState('original');
 const [cropZoom,setCropZoom]=useState(100);
 const [previewUrl,setPreviewUrl]=useState('');
 useEffect(()=>{if(!file){setPreviewUrl('');return;}const url=URL.createObjectURL(file);setPreviewUrl(url);return()=>URL.revokeObjectURL(url);},[file]);
 async function getUploadFile(original:File):Promise<File>{
  if(cropAspect==='original' && cropZoom===100)return original;
  const image=await createImageBitmap(original);
  try{
   const aspect=cropAspect==='square'?1:cropAspect==='wide'?16/9:cropAspect==='portrait'?4/5:image.width/image.height;
   let w=image.width,h=image.height;
   if(w/h>aspect)w=h*aspect;else h=w/aspect;
   w/=cropZoom/100;h/=cropZoom/100;
   const outW=Math.min(2400,Math.max(1,Math.round(w)));const outH=Math.max(1,Math.round(outW/aspect));
   const canvas=document.createElement('canvas');canvas.width=outW;canvas.height=outH;
   const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image editing is not supported in this browser');
   ctx.drawImage(image,(image.width-w)/2,(image.height-h)/2,w,h,0,0,outW,outH);
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error('Could not generate cropped image')),'image/webp',0.9));
   return new File([blob],original.name.replace(/\.[^.]+$/,'')+'-cropped.webp',{type:'image/webp'});
  }finally{image.close();}
 }
 useEffect(()=>{if(!open)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!uploading)setOpen(false);};window.addEventListener('keydown',escape);closeButton.current?.focus();return()=>window.removeEventListener('keydown',escape);},[open,uploading]);
 async function load(){setBusy(true);setError('');try{
  const result=await fetch('/api/admin/media',{cache:'no-store',credentials:'same-origin'});
  const data=await result.json();
  if(!result.ok)throw Error(data.error||'Could not load media library');
  setAssets((Array.isArray(data.items)?data.items:[]).filter((a:Asset)=>typeof a.public_url==='string' && /^https:\/\//.test(a.public_url)));
 }catch(err){setError(err instanceof Error?err.message:'Media library unavailable');}finally{setBusy(false);}}
 function show(){setOpen(true);setFile(null);setAlt('');setSearch('');void load();}
 function select(asset:Asset){if(!asset.public_url)return;onSelect({url:asset.public_url,alt:asset.alt_text||asset.original_name});setOpen(false);}
 async function upload(){if(!file||uploading)return;
  if(!formats.includes(file.type)||file.size<1||file.size>8*1024*1024){setError('Choose a JPG, PNG, WebP or AVIF image smaller than 8 MB.');return;}
  setUploading(true);setError('');
  try{
   const form=new FormData();form.append('file',await getUploadFile(file));form.append('alt_text',alt.trim()||file.name.replace(/\.[^.]+$/,''));
   const response=await fetch('/api/admin/media',{method:'POST',body:form,credentials:'same-origin'});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Image upload failed');
   const asset=data.item as Asset;
   if(!asset?.public_url||!/^https:\/\//.test(asset.public_url))throw Error('Uploaded image did not return a valid secure URL');
   setAssets(existing=>[asset,...existing.filter(a=>a.id!==asset.id)]);
   select(asset);
  }catch(err){setError(err instanceof Error?err.message:'Could not upload image');}
  finally{setUploading(false);}
 }
 const filtered=assets.filter(a=>`${a.original_name} ${a.alt_text||''}`.toLowerCase().includes(search.toLowerCase()));
 return <>
  <button type="button" className="cms-media-pick-trigger" onClick={show}><ImageIcon size={15}/> Choose or upload image</button>
  {open&&<div className="cms-picker-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!uploading)setOpen(false);}}>
   <section className="cms-picker-dialog" role="dialog" aria-modal="true" aria-label="Choose or upload an image">
    <header className="cms-picker-header"><div><h3>Image Library</h3><small>Select an existing asset or upload a new image.</small></div><button ref={closeButton} type="button" disabled={uploading} aria-label="Close image picker" onClick={()=>setOpen(false)}><X size={18}/></button></header>
    <form className="cms-picker-upload" onSubmit={e=>{e.preventDefault();void upload();}}>
     <label><span>Upload new image (JPG, PNG, WebP, AVIF; maximum 8 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={e=>{setFile(e.target.files?.[0]||null);setCropAspect('original');setCropZoom(100);setError('');}}/></label>
     {previewUrl&&<div className="cms-crop-tools">
      <p style={{margin:'4px 0 8px'}}>Optional image crop (centered). Original file is preserved unless you choose a crop.</p>
      <img src={previewUrl} alt="Preview of selected image for cropping" style={{maxWidth:'100%',height:165,objectFit:'contain',borderRadius:10,background:'#111827'}}/>
      <label><span>Crop aspect ratio</span><select value={cropAspect} disabled={uploading} onChange={e=>setCropAspect(e.target.value)}>
       <option value="original">Original ratio</option><option value="square">Square 1:1</option><option value="wide">Landscape 16:9</option><option value="portrait">Portrait 4:5</option>
      </select></label>
      <label><span>Zoom / centered crop: {cropZoom}%</span><input type="range" min="100" max="200" step="5" value={cropZoom} disabled={uploading} onChange={e=>setCropZoom(Number(e.target.value))}/></label>
      <small>Crop is applied before upload and saved as WebP. For precise subject framing, prepare the image in an image editor first.</small>
     </div>}
     <label><span>Image description / alt text</span><input type="text" maxLength={250} value={alt} placeholder="Describe what is shown in the image" onChange={e=>setAlt(e.target.value)} disabled={uploading}/></label>
     <button type="submit" disabled={!file||uploading}><UploadCloud size={16}/>{uploading?'Uploading…':'Upload & use image'}</button>
    </form>
    <div className="cms-picker-toolbar"><input aria-label="Search images" placeholder="Search image names or alt text" value={search} onChange={e=>setSearch(e.target.value)}/><button type="button" disabled={busy||uploading} onClick={()=>void load()}><RefreshCw size={15}/> Refresh</button></div>
    {error&&<p className="cms-error" role="alert">{error}</p>}
    {busy?<p role="status">Loading images…</p>:<div className="cms-picker-grid">{filtered.map(a=><button type="button" key={a.id} disabled={uploading} onClick={()=>select(a)}><img src={a.public_url!} loading="lazy" alt={a.alt_text||a.original_name}/><span>{a.original_name}</span></button>)}{filtered.length===0&&!error&&<p>No matching images. Upload one here, or refresh the library.</p>}</div>}
   </section>
  </div>}
 </>;
}
