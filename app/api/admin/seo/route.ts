import {createHash} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';import {can} from '@/lib/auth';import {requireAdminPermission} from '@/lib/admin-api';
import {getSiteSettings} from '@/lib/site-settings';import {designSettingKeys,validDesignSetting} from '@/lib/design-validation';
const fingerprint=(settings:Record<string,string>)=>createHash('sha256').update(JSON.stringify(Object.entries(settings).sort(([a],[b])=>a.localeCompare(b)))).digest('hex');
export async function GET(request:NextRequest){
 const {user,response}=await requireAdminPermission(request,'settings','VIEW');if(response)return response;
 const live=await getSiteSettings();const draft=await db.query('SELECT setting_value,updated_at FROM global_settings WHERE setting_key=$1',['admin_seo_'+user!.id]);
 const revisions=await db.query("SELECT revision_number,created_at FROM content_revisions WHERE entity_type='site_seo' AND entity_id=$1 ORDER BY revision_number DESC LIMIT 20",[user!.id]);
 const requested=new URL(request.url).searchParams.get('revision');let restored:Record<string,string>|null=null;
 if(requested){if(!/^\d{1,9}$/.test(requested))return NextResponse.json({error:'Invalid revision.'},{status:400});const selected=await db.query("SELECT snapshot FROM content_revisions WHERE entity_type='site_seo' AND entity_id=$1 AND revision_number=$2",[user!.id,Number(requested)]);if(!selected.rows[0]?.snapshot?.settings)return NextResponse.json({error:'Revision not found.'},{status:404});restored=selected.rows[0].snapshot.settings;}
 const row=draft.rows[0],saved=restored||row?.setting_value?.settings;return NextResponse.json({hasDraft:!!saved,settings:{seo_pages:saved?.seo_pages||live.seo_pages,social_image_url:saved?.social_image_url??live.social_image_url,social_image_alt:saved?.social_image_alt??live.social_image_alt},version:row?.updated_at||null,baseFingerprint:restored?fingerprint(live):row?.setting_value?.baseFingerprint||fingerprint(live),liveFingerprint:fingerprint(live),revisions:revisions.rows},{headers:{'Cache-Control':'no-store, private'}});
}
export async function POST(request:NextRequest){
 const {user,response}=await requireAdminPermission(request,'settings','EDIT');if(response)return response;
 const body=await request.json().catch(()=>null);const publish=body?.mode==='publish';
 if(publish&&!can(user!,'settings','PUBLISH'))return NextResponse.json({error:'Publishing permission required.'},{status:403});
 if(!body?.settings||typeof body.settings!=='object'||Array.isArray(body.settings)||typeof body.baseFingerprint!=='string')return NextResponse.json({error:'Invalid SEO draft.'},{status:400});
 const entries=Object.entries(body.settings);if(!entries.length||entries.length>designSettingKeys.length||entries.some(([key,value])=>!['seo_pages','social_image_url','social_image_alt'].includes(key) || !designSettingKeys.includes(key as typeof designSettingKeys[number])||!validDesignSetting(key,value)))return NextResponse.json({error:'Invalid SEO value.'},{status:400});
 const client=await db.connect(),key='admin_seo_'+user!.id;
 try{
  await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[key]);
  if(publish)await client.query('SELECT pg_advisory_xact_lock($1)',[5183032]);
  const previous=await client.query('SELECT setting_value,updated_at FROM global_settings WHERE setting_key=$1 FOR UPDATE',[key]);
  const row=previous.rows[0];
  if(row&&(!body.version||new Date(row.updated_at).getTime()!==Date.parse(body.version))){await client.query('ROLLBACK');return NextResponse.json({error:'This draft changed in another editor. Your edits are still here; reload before saving.',code:'VERSION_CONFLICT'},{status:409});}
  const live=await getSiteSettings();
  if(publish&&body.baseFingerprint!==fingerprint(live)){await client.query('ROLLBACK');return NextResponse.json({error:'Live settings changed after this draft began. Reload and compare before publishing.',code:'LIVE_VERSION_CONFLICT'},{status:409});}
  const revision=await client.query("SELECT COALESCE(MAX(revision_number),0)+1 AS n FROM content_revisions WHERE entity_type='site_seo' AND entity_id=$1",[user!.id]);
  await client.query('INSERT INTO content_revisions(entity_type,entity_id,revision_number,snapshot,created_by) VALUES($1,$2,$3,$4::jsonb,$5)',['site_seo',user!.id,revision.rows[0].n,JSON.stringify({settings:row?.setting_value?.settings||live,baseFingerprint:fingerprint(live)}),user!.id]);
  let version=null,baseFingerprint=body.baseFingerprint;
  if(publish){
   for(const [key,value] of entries)await client.query('INSERT INTO global_settings(setting_key,setting_value,updated_by) VALUES($1,$2::jsonb,$3) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_by=EXCLUDED.updated_by,updated_at=NOW()',[key,JSON.stringify({value}),user!.id]);
   await client.query('DELETE FROM global_settings WHERE setting_key=$1',[key]);baseFingerprint=fingerprint({...live,...body.settings});
  }else{
   const saved=await client.query('INSERT INTO global_settings(setting_key,setting_value,updated_by) VALUES($1,$2::jsonb,$3) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_by=EXCLUDED.updated_by,updated_at=NOW() RETURNING updated_at',[key,JSON.stringify({settings:body.settings,baseFingerprint:body.baseFingerprint}),user!.id]);version=saved.rows[0].updated_at;
  }
  await client.query('INSERT INTO audit_logs(actor_user_id,action,module,details) VALUES($1,$2,$3,$4::jsonb)',[user!.id,publish?'PUBLISH_SEO':'SAVE_SEO_DRAFT','settings',JSON.stringify({fields:entries.length})]);
  await client.query('COMMIT');return NextResponse.json({ok:true,version,baseFingerprint,published:publish},{headers:{'Cache-Control':'no-store'}});
 }catch{await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'SEO save failed; no changes published.'},{status:500});}
 finally{client.release();}
}
