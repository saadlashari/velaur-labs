import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { db } from '@/lib/db';
import { requireAdminPermission, writeAudit } from '@/lib/admin-api';
import {isRasterImage} from '@/lib/image-validation';

export const runtime = 'nodejs';
const accepted = new Set(['image/png','image/jpeg','image/webp','image/avif']);
const mediaId = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;

export async function GET(request: NextRequest) {
  const {response} = await requireAdminPermission(request,'media','READ'); if(response)return response;
  try {const {rows}=await db.query('SELECT id,original_name,mime_type,byte_size,public_url,alt_text,created_at FROM media_assets ORDER BY created_at DESC LIMIT 100');return NextResponse.json({items:rows});}
  catch {return NextResponse.json({error:'Could not load media assets'},{status:500});}
}

export async function POST(request: NextRequest) {
  const {response,user}=await requireAdminPermission(request,'media','CREATE');if(response)return response;
  const cloud=process.env.CLOUDINARY_CLOUD_NAME;
  const key=process.env.CLOUDINARY_API_KEY;
  const secret=process.env.CLOUDINARY_API_SECRET;
  if(!cloud||!key||!secret)return NextResponse.json({error:'Image storage is not configured. Set the Cloudinary environment variables.'},{status:503});
  try {
    const form=await request.formData();const file=form.get('file');const alt=String(form.get('alt_text')||'').trim().slice(0,250);
    if(!(file instanceof File)||!accepted.has(file.type)||file.size<1||file.size>8*1024*1024)return NextResponse.json({error:'Upload a JPG, PNG, WebP or AVIF image (max 8 MB)'},{status:400});
    if(!await isRasterImage(file))return NextResponse.json({error:'Image content does not match its file type.'},{status:400});
    // Do not trust a client-supplied filename, file path, or storage URL.
    const timestamp=Math.floor(Date.now()/1000);
    const folder='velaur-labs';
    const toSign=`folder=${folder}&timestamp=${timestamp}${secret}`;
    const signature=createHash('sha1').update(toSign).digest('hex');
    const payload=new FormData();payload.append('file',file);payload.append('api_key',key);payload.append('timestamp',String(timestamp));payload.append('folder',folder);payload.append('signature',signature);
    const result=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,{method:'POST',body:payload,cache:'no-store',signal:AbortSignal.timeout(10000)});
    const uploaded=await result.json() as {public_id?:string;secure_url?:string;error?:{message?:string};bytes?:number;format?:string};
    if(!result.ok||!uploaded.public_id||!uploaded.secure_url) return NextResponse.json({error:'Storage upload failed: '+(uploaded.error?.message||'Please retry')},{status:502});
    const saved=await db.query('INSERT INTO media_assets(storage_provider,storage_key,public_url,original_name,mime_type,byte_size,alt_text,uploaded_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,original_name,public_url,alt_text,created_at', ['cloudinary',uploaded.public_id,uploaded.secure_url,file.name.slice(0,250),file.type,file.size,alt,user!.id]);
    await writeAudit(user!.id,'CREATE','media',saved.rows[0].id,{storage:'cloudinary'});
    return NextResponse.json({item:saved.rows[0]},{status:201});
  } catch {return NextResponse.json({error:'Upload failed. Check storage and database configuration.'},{status:500});}
}

export async function PATCH(request:NextRequest){
 const {response,user}=await requireAdminPermission(request,'media','UPDATE');if(response)return response;
 try{const {id,alt_text}=await request.json();if(!mediaId.test(id)||typeof alt_text!=='string'||alt_text.length>250)return NextResponse.json({error:'Invalid asset details'},{status:400});
 const updated=await db.query('UPDATE media_assets SET alt_text=$1 WHERE id=$2 RETURNING id,alt_text',[alt_text,id]);if(!updated.rowCount)return NextResponse.json({error:'Asset not found'},{status:404});await writeAudit(user!.id,'UPDATE','media',id);return NextResponse.json({item:updated.rows[0]});}
 catch{return NextResponse.json({error:'Could not update media'},{status:500});}
}
