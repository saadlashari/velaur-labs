import {hasValidOrigin} from '@/lib/request-security';
import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {getCurrentAdmin,createTotpSecret,decryptSecret,encryptSecret,verifyPassword,verifyTotp} from '@/lib/auth';
import {writeAudit} from '@/lib/admin-api';
import {createRecoveryCodes,hashedRecoveryCodes,recoverySettingKey,recoveryCodeCount} from '@/lib/recovery-codes';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
async function guard(req:NextRequest){
 const user=await getCurrentAdmin().catch(()=>null);
 if(!user)return {user:null,error:NextResponse.json({error:'Authentication required'},{status:401,headers})};
 if(req.method!=='GET'){
  if(!hasValidOrigin(req))return {user:null,error:NextResponse.json({error:'Invalid origin'},{status:403,headers})};
 }
 return {user,error:null};
}
export async function GET(req:NextRequest){
 const {user,error}=await guard(req);if(error)return error;
 const rows=await db.query<{two_factor_enabled:boolean}>('SELECT two_factor_enabled FROM admin_users WHERE id=$1',[user!.id]);
 return NextResponse.json({enabled:rows.rows[0]?.two_factor_enabled===true,recoveryRemaining:await recoveryCodeCount(user!.id)},{headers});
}
export async function POST(req:NextRequest){
 const {user,error}=await guard(req);if(error)return error;
 try{
  const body=await req.json() as {password?:string};
  const rows=await db.query<{password_hash:string;two_factor_enabled:boolean;email:string}>('SELECT password_hash,two_factor_enabled,email FROM admin_users WHERE id=$1',[user!.id]);
  const account=rows.rows[0];
  if(!account||!await verifyPassword(String(body.password||''),account.password_hash))return NextResponse.json({error:'Incorrect current password'},{status:403,headers});
  if(account.two_factor_enabled)return NextResponse.json({error:'2FA already enabled'},{status:409,headers});
  const secret=createTotpSecret();
  await db.query(`INSERT INTO global_settings(setting_key,setting_value,updated_by) VALUES($1,$2::jsonb,$3) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_by=EXCLUDED.updated_by,updated_at=NOW()`,[`admin_2fa_pending_${user!.id}`,JSON.stringify({secret:encryptSecret(secret),expiresAt:new Date(Date.now()+600000).toISOString()}),user!.id]);
  const uri=`otpauth://totp/${encodeURIComponent('VELAUR LABS:'+account.email)}?secret=${secret}&issuer=${encodeURIComponent('VELAUR LABS')}&algorithm=SHA1&digits=6&period=30`;
  return NextResponse.json({secret,uri,expiresInSeconds:600},{headers});
 }catch{return NextResponse.json({error:'Could not begin 2FA setup'},{status:500,headers});}
}
export async function PUT(req:NextRequest){
 const {user,error}=await guard(req);if(error)return error;
 const body=await req.json().catch(()=>({})) as {code?:string};
 if(!/^\d{6}$/.test(String(body.code||'')))return NextResponse.json({error:'Six-digit code required'},{status:400,headers});
 const client=await db.connect();
 try{
  await client.query('BEGIN');
  const check=await client.query<{two_factor_enabled:boolean}>('SELECT two_factor_enabled FROM admin_users WHERE id=$1 FOR UPDATE',[user!.id]);
  if(check.rows[0]?.two_factor_enabled){await client.query('ROLLBACK');return NextResponse.json({error:'2FA already enabled'},{status:409,headers});}
  const result=await client.query<{setting_value:{secret:string;expiresAt:string}}>('SELECT setting_value FROM global_settings WHERE setting_key=$1 FOR UPDATE',[`admin_2fa_pending_${user!.id}`]);
  const pending=result.rows[0]?.setting_value;
  if(!pending?.secret||!pending.expiresAt||Date.parse(pending.expiresAt)<Date.now()) {await client.query('ROLLBACK');return NextResponse.json({error:'Setup expired. Start again.'},{status:410,headers});}
  const secret=decryptSecret(pending.secret);
  if(!verifyTotp(secret,String(body.code))){await client.query('ROLLBACK');return NextResponse.json({error:'Incorrect or expired code'},{status:400,headers});}
  await client.query('UPDATE admin_users SET two_factor_secret_encrypted=$2,two_factor_enabled=TRUE,updated_at=NOW() WHERE id=$1',[user!.id,encryptSecret(secret)]);
  await client.query('DELETE FROM global_settings WHERE setting_key=$1',[`admin_2fa_pending_${user!.id}`]);
  const recoveryCodes=createRecoveryCodes();
  await client.query(`INSERT INTO global_settings(setting_key,setting_value,updated_by) VALUES($1,$2::jsonb,$3) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_by=EXCLUDED.updated_by,updated_at=NOW()`,[recoverySettingKey(user!.id),JSON.stringify({hashes:hashedRecoveryCodes(recoveryCodes)}),user!.id]);
  await client.query('COMMIT');
  await writeAudit(user!.id,'2FA_ENABLED','AUTH',user!.id).catch(()=>undefined);
  return NextResponse.json({ok:true,recoveryCodes},{headers});
 }catch{await client.query('ROLLBACK').catch(()=>undefined);return NextResponse.json({error:'Could not enable 2FA'},{status:500,headers});}
 finally{client.release();}
}

// Rotating recovery codes invalidates every previous unused recovery code.
// Require both the account password and a fresh TOTP code.
export async function PATCH(req:NextRequest){
 const {user,error}=await guard(req);if(error)return error;
 const body=await req.json().catch(()=>({})) as {password?:string;code?:string};
 if(!body.password||!/^\d{6}$/.test(String(body.code||'')))return NextResponse.json({error:'Current password and a six-digit authenticator code are required'},{status:400,headers});
 const account=await db.query<{password_hash:string;two_factor_enabled:boolean;two_factor_secret_encrypted:string|null}>('SELECT password_hash,two_factor_enabled,two_factor_secret_encrypted FROM admin_users WHERE id=$1',[user!.id]);
 const record=account.rows[0];
 if(!record?.two_factor_enabled||!record.two_factor_secret_encrypted)return NextResponse.json({error:'2FA is not enabled'},{status:409,headers});
 if(!await verifyPassword(body.password,record.password_hash))return NextResponse.json({error:'Incorrect password'},{status:403,headers});
 if(!verifyTotp(decryptSecret(record.two_factor_secret_encrypted),String(body.code)))return NextResponse.json({error:'Incorrect authenticator code'},{status:403,headers});
 const codes=createRecoveryCodes();
 await db.query(`INSERT INTO global_settings(setting_key,setting_value,updated_by) VALUES($1,$2::jsonb,$3) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_by=EXCLUDED.updated_by,updated_at=NOW()`,[recoverySettingKey(user!.id),JSON.stringify({hashes:hashedRecoveryCodes(codes)}),user!.id]);
 await writeAudit(user!.id,'2FA_RECOVERY_ROTATED','AUTH',user!.id).catch(()=>undefined);
 return NextResponse.json({recoveryCodes:codes},{headers});
}
