import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminPermission, writeAudit } from '@/lib/admin-api';
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const states=['DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED'];
export async function GET(request:NextRequest){
 const {response}=await requireAdminPermission(request,'pages','READ');if(response)return response;
 try{const result=await db.query('SELECT id,slug,title,status,seo_title,meta_description,content,updated_at FROM pages ORDER BY updated_at DESC LIMIT 100');return NextResponse.json({items:result.rows});}catch{return NextResponse.json({error:'Could not load pages'},{status:500});}
}
export async function POST(request:NextRequest){
 const {response,user}=await requireAdminPermission(request,'pages','CREATE');if(response)return response;
 try{const data=await request.json();const {title,slug}=data;
 if(typeof title!=='string'||!title.trim()||title.length>160||typeof slug!=='string'||!slugPattern.test(slug))return NextResponse.json({error:'Provide a title and valid lowercase slug'},{status:400});
 const result=await db.query('INSERT INTO pages(slug,title,created_by,updated_by) VALUES ($1,$2,$3,$3) RETURNING *',[slug,title.trim(),user!.id]);await writeAudit(user!.id,'CREATE','pages',result.rows[0].id,{slug});return NextResponse.json({item:result.rows[0]},{status:201});
 }catch{return NextResponse.json({error:'Could not create page; slug may already exist'},{status:400});}
}
export async function PATCH(request:NextRequest){
 const {response,user}=await requireAdminPermission(request,'pages','UPDATE');if(response)return response;
 try{const {id,title,status,seo_title,meta_description}=await request.json();
 if(typeof id!=='string'||!/^[a-f\d-]{36}$/i.test(id)||typeof title!=='string'||!title.trim()||title.length>160||!states.includes(status))return NextResponse.json({error:'Invalid page fields'},{status:400});
 if((seo_title!==null&&seo_title!==undefined&&(typeof seo_title!=='string'||seo_title.length>250))||(meta_description!==null&&meta_description!==undefined&&(typeof meta_description!=='string'||meta_description.length>500)))return NextResponse.json({error:'SEO fields too long'},{status:400});
 if(status==='PUBLISHED' && user!.role!=='SUPER_ADMIN' && !user!.permissions?.pages?.includes('PUBLISH'))return NextResponse.json({error:'Publishing permission required'},{status:403});
 const current=await db.query('SELECT status FROM pages WHERE id=$1',[id]);
 if(!current.rowCount)return NextResponse.json({error:'Page not found'},{status:404});
 if(current.rows[0].status==='PUBLISHED'&&user!.role!=='SUPER_ADMIN'&&!(user!.permissions?.pages??[]).includes('PUBLISH'))return NextResponse.json({error:'Editing published pages requires publishing permission'},{status:403});
 const result=await db.query(`UPDATE pages SET title=$1,status=$2,seo_title=$3,meta_description=$4,updated_by=$5,updated_at=NOW(),published_at=CASE WHEN $2='PUBLISHED' THEN COALESCE(published_at,NOW()) ELSE published_at END WHERE id=$6 RETURNING *`,[title.trim(),status,seo_title||null,meta_description||null,user!.id,id]);
 if(!result.rowCount)return NextResponse.json({error:'Page not found'},{status:404});await writeAudit(user!.id,'UPDATE','pages',id,{status});return NextResponse.json({item:result.rows[0]});
 }catch{return NextResponse.json({error:'Could not update page'},{status:400});}
}
