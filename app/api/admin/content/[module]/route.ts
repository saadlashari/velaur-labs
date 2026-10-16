import {validArticleEditorial} from '@/lib/article-editorial';
import {articleWithDefaultCover} from '@/lib/blog-content';
import {projectWithEditorial} from '@/lib/project-editorial';
import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/lib/db';
import { requireAdminPermission, writeAudit } from '@/lib/admin-api';
import type { PoolClient } from 'pg';
import {can} from '@/lib/auth';import {defaultContent} from '@/lib/default-content';

type Mod = 'services' | 'projects' | 'blog';
const configs = {
  services: {table:'services',permission:'services',fields:['slug','title','category','summary','content','status','position','seo_title','meta_description']},
  projects: {table:'projects',permission:'projects',fields:['slug','title','category','page_type','summary','content','status','position','seo_title','meta_description','live_url','figma_url','app_store_url','play_store_url','is_featured']},
  blog: {table:'blog_posts',permission:'blog',fields:['slug','title','excerpt','category','body','status','seo_title','meta_description']},
} as const;
function config(module:string){return configs[module as Mod] ?? null;}
function checkPayload(input:unknown, module:Mod){
  if (!input || typeof input!=='object' || Array.isArray(input)) throw new Error('Invalid form data');
  const data=input as Record<string,unknown>; const allowed=new Set<string>(configs[module].fields);
  const values:Record<string,unknown>={};
  for(const [k,v] of Object.entries(data)){
    if(!allowed.has(k)) throw new Error(`Unsupported field ${k}`);
    if(['content','body'].includes(k)){
      if(!v || typeof v!=='object'||Array.isArray(v)) throw new Error(`Invalid ${k}`);
      const content=v as Record<string,unknown>;
      if(module==='services' && k==='content'){
        if('deliverables' in content && (!Array.isArray(content.deliverables)||content.deliverables.length>12||content.deliverables.some(item=>typeof item!=='string'||item.length>180)))throw new Error('Service deliverables must be a list of up to 12 short items');
        for(const [field,max,limit] of [['process',6,400],['outcomes',8,500]] as const){
          if(field in content && (!Array.isArray(content[field]) || (content[field] as unknown[]).length>max || (content[field] as unknown[]).some(item=>!item||typeof item!=='object'||Array.isArray(item)||typeof (item as Record<string,unknown>).title!=='string'||!(item as {title:string}).title.trim()||(item as {title:string}).title.length>180||typeof (item as Record<string,unknown>).description!=='string'||!(item as {description:string}).description.trim()||(item as {description:string}).description.length>limit)))throw new Error(`Invalid service ${field}`);
        }
        if('faqs' in content && (!Array.isArray(content.faqs)||content.faqs.length>12||content.faqs.some(item=>!item||typeof item!=='object'||Array.isArray(item)||typeof item.question!=='string'||typeof item.answer!=='string'||item.question.length>200||item.answer.length>1200)))throw new Error('Service FAQs must contain up to 12 questions and answers');
        if('paragraphs' in content && (!Array.isArray(content.paragraphs)||content.paragraphs.some(item=>typeof item!=='string'||item.length>12000)))throw new Error('Invalid service paragraphs');
      }
      if(module==='blog' && k==='body'){
        if('editorial' in content&&!validArticleEditorial(content.editorial))throw new Error('Invalid article editorial notes, sources or review date');
        if('cover' in content && content.cover!==null){
          const cover=content.cover;
          if(!cover||typeof cover!=='object'||Array.isArray(cover))throw new Error('Invalid blog cover');
          const {url,alt}=cover as Record<string,unknown>;
          if(typeof url!=='string'||url.length>2048||(!/^https:\/\/[^\s]+$/i.test(url)&&!/^\/blog\/[a-z0-9-]+\.svg$/.test(url))||typeof alt!=='string'||!alt.trim()||alt.length>250)throw new Error('Blog cover requires a valid image URL and alt text');
        }
        if('sections' in content && (!Array.isArray(content.sections)||content.sections.length>30||content.sections.some(item=>!item||typeof item!=='object'||Array.isArray(item)||typeof item.heading!=='string'||!item.heading.trim()||item.heading.length>180||typeof item.text!=='string'||!item.text.trim()||item.text.length>6000)))throw new Error('Blog sections must include headings and text (max 30)');
        if('paragraphs' in content && (!Array.isArray(content.paragraphs)||content.paragraphs.some(item=>typeof item!=='string'||item.length>12000)))throw new Error('Invalid blog paragraphs');
      }
      if(module==='projects' && k==='content'){
        for(const field of ['challenge','solution','outcome','scope_note','access_notes','featured_summary']){
          if(field in content && (typeof content[field]!=='string'||(content[field] as string).length>3000))throw new Error(`${field} must be text up to 3000 characters`);
        }
        if('paragraphs' in content && (!Array.isArray(content.paragraphs)||content.paragraphs.some(item=>typeof item!=='string'||item.length>12000)))throw new Error('Invalid project paragraphs');
      }
      if(module==='projects' && k==='content' && 'gallery' in content){
        if(!Array.isArray(content.gallery)||content.gallery.length>20)throw new Error('Project gallery supports up to 20 images');
        for(const image of content.gallery){
          if(!image||typeof image!=='object'||Array.isArray(image))throw new Error('Invalid gallery image');
          const picture=image as Record<string,unknown>;
          if(typeof picture.url!=='string'||(!/^https:\/\/[^\s]+$/i.test(picture.url)&&!/^\/project-media\/[a-z0-9-]+\.(webp|png|jpg|avif)$/.test(picture.url))||picture.url.length>2048)throw new Error('Gallery images require a valid HTTPS or bundled project-media URL');
          if(typeof picture.alt!=='string'||!picture.alt.trim()||picture.alt.length>250)throw new Error('Each gallery image needs descriptive alt text (up to 250 characters)');
          if(picture.caption!==undefined&&(typeof picture.caption!=='string'||picture.caption.length>240))throw new Error('Invalid gallery caption');
        }
      }
      if(JSON.stringify(v).length>80000)throw new Error(`${k} is too large`);
      values[k]=JSON.stringify(module==='projects'?{...content,editorial_version:2}:v);continue;
    }
    if(['position'].includes(k)){if(!Number.isInteger(v)||Number(v)<0||Number(v)>100000) throw new Error('Invalid position');values[k]=v;continue;}
    if(k==='is_featured'){if(typeof v!=='boolean')throw new Error('Invalid featured flag');values[k]=v;continue;}
    if(v!==null&&(typeof v!=='string'||v.length>12000))throw new Error(`Invalid ${k}`);
    values[k]=v;
  }
  if('slug' in values && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(values.slug)))throw new Error('Slug should use lower-case words and hyphens');
  if('status' in values && !['DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED'].includes(String(values.status)))throw new Error('Invalid status');
  if('category' in values && module==='projects' && !['WEBSITE','WEB_APPLICATION','MOBILE_APP'].includes(String(values.category)))throw new Error('Invalid project category');
  if('page_type' in values && !['SIMPLE','CASE_STUDY'].includes(String(values.page_type)))throw new Error('Invalid page type');
  for(const key of ['live_url','figma_url','app_store_url','play_store_url']) if(typeof values[key]==='string' && values[key] && !/^https:\/\/[^\s]+$/i.test(values[key] as string))throw new Error(`${key} must be an HTTPS URL`);
  return values;
}
async function gate(request:NextRequest,module:string,action:string){const cfg=config(module);if(!cfg)return {cfg:null,user:null,response:NextResponse.json({error:'Unknown content module'},{status:404})};const result=await requireAdminPermission(request,cfg.permission,action);return {cfg,user:result.user,response:result.response};}
export async function GET(request:NextRequest,{params}:{params:Promise<{module:string}>}){
 const {module}=await params;const {cfg,response}=await gate(request,module,'READ');if(response)return response;
 if(!isDatabaseConfigured())return NextResponse.json({error:'DATABASE_URL is not configured'},{status:503});
 try{const result=await db.query(`SELECT * FROM ${cfg!.table} ORDER BY updated_at DESC LIMIT 200`);const controlled=await db.query<{slug:string}>(`SELECT slug FROM ${cfg!.table}`);const known=new Set(controlled.rows.map(row=>row.slug));const defaults=defaultContent(module).filter(item=>!known.has(String(item.slug))).map(item=>({...item,id:'default:'+item.slug,status:'PUBLISHED',is_default:true}));return NextResponse.json({items:[...(module==='projects'?result.rows.map(projectWithEditorial):module==='blog'?result.rows.map(articleWithDefaultCover):result.rows),...defaults]});}catch{return NextResponse.json({error:'Could not load content'},{status:500});}
}
export async function POST(request:NextRequest,{params}:{params:Promise<{module:string}>}){
 const {module}=await params;const {cfg,user,response}=await gate(request,module,'CREATE');if(response)return response;
 try{
  const data=checkPayload(await request.json(),module as Mod);
  if(!data.slug||!data.title||(module==='projects'&&!data.category))return NextResponse.json({error:'Title, slug and project category are required'},{status:400});
  if(module==='services'&&!data.category)data.category='SOFTWARE';
  if(!user)return NextResponse.json({error:'Authentication required'},{status:401});
  if(defaultContent(module).some(item=>item.slug===data.slug)&&!can(user,cfg!.permission,'PUBLISH'))return NextResponse.json({error:'Changing content already visible on the website requires publishing permission.'},{status:403});
  if(data.status==='ARCHIVED'&&!can(user,cfg!.permission,'DELETE'))return NextResponse.json({error:'Deleting content requires delete permission.'},{status:403});
  if(data.status==='PUBLISHED' && user.role!=='SUPER_ADMIN' && !(user.permissions?.[cfg!.permission]??[]).includes('PUBLISH'))return NextResponse.json({error:'Publishing requires approval'},{status:403});
  const keys=[...Object.keys(data),'created_by','updated_by'];const params=[...Object.values(data),user.id,user.id];
  const cols=keys.map(k=>'"'+k+'"').join(',');const values=keys.map((_,i)=>'$'+(i+1)).join(',');
  const result=await db.query(`INSERT INTO ${cfg!.table} (${cols}) VALUES (${values}) RETURNING *`,params);
  await writeAudit(user.id,'CREATE',module,result.rows[0].id,{slug:data.slug});return NextResponse.json({item:result.rows[0]},{status:201});
 }catch(e){return NextResponse.json({error:e instanceof Error&&e.message.includes('duplicate')?'Slug already exists':e instanceof Error?e.message:'Request failed'},{status:400});}
}
export async function PATCH(request:NextRequest,{params}:{params:Promise<{module:string}>}){
 const {module}=await params;const {cfg,user,response}=await gate(request,module,'UPDATE');if(response)return response;
 let client:PoolClient|undefined;
 try{
  const body=await request.json();const id=body.id;
  if(typeof id!=='string'||!/^[a-f\d-]{36}$/i.test(id))return NextResponse.json({error:'Valid record ID required'},{status:400});
  if(typeof body.expectedUpdatedAt!=='string'||!Number.isFinite(Date.parse(body.expectedUpdatedAt)))return NextResponse.json({error:'Refresh this record before saving: version information is missing.'},{status:428});
  const data=checkPayload(body.data,module as Mod);
  if(!Object.keys(data).length)return NextResponse.json({error:'Nothing to update'},{status:400});
  const publisher=user!.role==='SUPER_ADMIN'||(user!.permissions?.[cfg!.permission]??[]).includes('PUBLISH');
  if(data.status==='PUBLISHED'&&!publisher)return NextResponse.json({error:'Publishing requires approval'},{status:403});
  client=await db.connect();await client.query('BEGIN');
  const current=await client.query(`SELECT status,updated_at FROM ${cfg!.table} WHERE id=$1 FOR UPDATE`,[id]);
  if(!current.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'Record not found'},{status:404});}
  if(new Date(current.rows[0].updated_at).getTime()!==new Date(body.expectedUpdatedAt).getTime()){
   await client.query('ROLLBACK');
   return NextResponse.json({error:'Someone else updated this record. Your edits are still here. Copy any important changes, then refresh to see the latest version.',conflict:true},{status:409});
  }
  if(current.rows[0].status==='PUBLISHED'&&!publisher){await client.query('ROLLBACK');return NextResponse.json({error:'Editing published content requires PUBLISH permission; submit a review request instead.'},{status:403});}
  const keys=Object.keys(data);const values=[...Object.values(data),user!.id,id];
  const set=keys.map((k,i)=>`"${k}"=$${i+1}`).join(',');
  const result=await client.query(`UPDATE ${cfg!.table} SET ${set},updated_by=$${keys.length+1},updated_at=NOW()${data.status==='PUBLISHED'?',published_at=COALESCE(published_at,NOW())':''} WHERE id=$${keys.length+2} RETURNING *`,values);
  await client.query('COMMIT');
  await writeAudit(user!.id,'UPDATE',module,id,{fields:keys}).catch(()=>undefined);
  return NextResponse.json({item:result.rows[0]});
 }catch(e){if(client)await client.query('ROLLBACK').catch(()=>undefined);return NextResponse.json({error:e instanceof Error?e.message:'Update failed'},{status:400});}
 finally{client?.release();}
}
export async function DELETE(request:NextRequest,{params}:{params:Promise<{module:string}>}){
 const {module}=await params;const {cfg,user,response}=await gate(request,module,'DELETE');if(response)return response;
 try{const body=await request.json();if(typeof body.id!=='string'||!/^[a-f\d-]{36}$/i.test(body.id))return NextResponse.json({error:'Valid record ID required'},{status:400});
 const current=await db.query(`SELECT status FROM ${cfg!.table} WHERE id=$1`,[body.id]);
 if(current.rows[0]?.status==='PUBLISHED'&&user!.role!=='SUPER_ADMIN'&&!(user!.permissions?.[cfg!.permission]??[]).includes('PUBLISH'))return NextResponse.json({error:'Archiving published content requires publishing permission'},{status:403});
 const result=await db.query(`UPDATE ${cfg!.table} SET status='ARCHIVED',updated_by=$2,updated_at=NOW() WHERE id=$1 RETURNING id`,[body.id,user!.id]);if(!result.rowCount)return NextResponse.json({error:'Not found'},{status:404});await writeAudit(user!.id,'ARCHIVE',module,body.id);return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Unable to archive'},{status:500});}
}
