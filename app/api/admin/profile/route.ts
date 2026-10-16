import {isRasterImage} from '@/lib/image-validation';
import {hasValidOrigin} from '@/lib/request-security';
import {NextRequest,NextResponse} from 'next/server';
import {getCurrentAdmin,hashPassword,verifyPassword,hashToken,SESSION_COOKIE} from '@/lib/auth';
import {db} from '@/lib/db';
import {writeAudit} from '@/lib/admin-api';
import {createHash} from 'node:crypto';
async function authorize(req:NextRequest){
 const user=await getCurrentAdmin().catch(()=>null);
 if(!user)return {user:null,error:NextResponse.json({error:'Authentication required'},{status:401})};
 if(req.method!=='GET'){
 if(!hasValidOrigin(req))return {user,error:NextResponse.json({error:'Invalid request origin'},{status:403})};
 }return {user,error:null};
}
export async function GET(req:NextRequest){const {user,error}=await authorize(req);if(error)return error;const av=await db.query<{setting_value:{value?:string}}>('SELECT setting_value FROM global_settings WHERE setting_key=$1',[`admin_avatar_${user!.id}`]);return NextResponse.json({profile:{display_name:user!.display_name,email:user!.email,theme:user!.theme,role:user!.role,avatar_url:av.rows[0]?.setting_value?.value||''}})}
export async function PUT(req:NextRequest){const {user,error}=await authorize(req);if(error)return error;
 try{const body=await req.json();const name=String(body.display_name??'').trim(),email=String(body.email??'').trim().toLowerCase();const theme=body.theme;
 if(name.length<2||name.length>90||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||!['dark','light'].includes(theme))return NextResponse.json({error:'Invalid profile details'},{status:400});
 const password=String(body.current_password??'');
 if(email!==user!.email){const check=await db.query<{password_hash:string}>('SELECT password_hash FROM admin_users WHERE id=$1',[user!.id]);if(!password||!await verifyPassword(password,check.rows[0]?.password_hash??''))return NextResponse.json({error:'Current password required to change email'},{status:400});}
 await db.query('UPDATE admin_users SET display_name=$1,email=$2,theme=$3,updated_at=NOW() WHERE id=$4',[name,email,theme,user!.id]);
 await writeAudit(user!.id,'UPDATE','profile',user!.id,{emailChanged:email!==user!.email});return NextResponse.json({ok:true});
 }catch(e){if((e as {code?:string}).code==='23505')return NextResponse.json({error:'Email already in use'},{status:409});return NextResponse.json({error:'Could not update profile'},{status:500});}}
export async function PATCH(req:NextRequest){const {user,error}=await authorize(req);if(error)return error;
 try{const body=await req.json();const current=String(body.current_password??''),next=String(body.new_password??'');
 if(next.length<12||next.length>128)return NextResponse.json({error:'New password must be 12–128 characters'},{status:400});
 const result=await db.query<{password_hash:string}>('SELECT password_hash FROM admin_users WHERE id=$1',[user!.id]);
 if(!await verifyPassword(current,result.rows[0]?.password_hash??''))return NextResponse.json({error:'Current password is incorrect'},{status:403});
 const hash=await hashPassword(next);
 const cookie=(await import('next/headers')).cookies;const token=(await cookie()).get(SESSION_COOKIE)?.value;
 const client=await db.connect();try{await client.query('BEGIN');await client.query('UPDATE admin_users SET password_hash=$1,updated_at=NOW() WHERE id=$2',[hash,user!.id]);
 await client.query('DELETE FROM admin_sessions WHERE user_id=$1 AND token_hash<>$2',[user!.id,token?hashToken(token):'']);await client.query('COMMIT');}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 await writeAudit(user!.id,'PASSWORD_CHANGE','profile',user!.id);return NextResponse.json({ok:true,message:'Password changed; other sessions signed out'});
 }catch{return NextResponse.json({error:'Password change failed'},{status:500});}}

export async function POST(req:NextRequest){
 const {user,error}=await authorize(req);if(error)return error;
 const cloud=process.env.CLOUDINARY_CLOUD_NAME,key=process.env.CLOUDINARY_API_KEY,secret=process.env.CLOUDINARY_API_SECRET;
 if(!cloud||!key||!secret)return NextResponse.json({error:'Cloudinary storage must be configured for avatar uploads'},{status:503});
 try{
  const form=await req.formData();const file=form.get('file');
  if(!(file instanceof File)||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size<1||file.size>3*1024*1024)return NextResponse.json({error:'Upload a PNG, JPG or WebP image, maximum 3 MB'},{status:400});
  if(!await isRasterImage(file))return NextResponse.json({error:'Image content does not match its type'},{status:400});
  const timestamp=Math.floor(Date.now()/1000),folder='velaur-labs/avatars';
  const signature=createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex');
  const payload=new FormData();payload.append('file',file);payload.append('api_key',key);payload.append('timestamp',String(timestamp));payload.append('folder',folder);payload.append('signature',signature);
  const response=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,{method:'POST',body:payload,cache:'no-store',signal:AbortSignal.timeout(10000)});
  const data=await response.json() as {secure_url?:string};if(!response.ok||!data.secure_url)return NextResponse.json({error:'Image storage rejected the upload'},{status:502});
  await db.query(`INSERT INTO global_settings(setting_key,setting_value,updated_by) VALUES($1,$2::jsonb,$3) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_by=EXCLUDED.updated_by,updated_at=NOW()`,[`admin_avatar_${user!.id}`,JSON.stringify({value:data.secure_url}),user!.id]);
  await writeAudit(user!.id,'AVATAR_UPDATE','profile',user!.id);
  return NextResponse.json({ok:true,url:data.secure_url});
 }catch{return NextResponse.json({error:'Could not save profile image'},{status:500})}
}
export async function DELETE(req:NextRequest){const {user,error}=await authorize(req);if(error)return error;await db.query('DELETE FROM global_settings WHERE setting_key=$1',[`admin_avatar_${user!.id}`]);await writeAudit(user!.id,'AVATAR_REMOVE','profile',user!.id);return NextResponse.json({ok:true});}
