import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminPermission } from '@/lib/admin-api';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Read-only legacy endpoint. All writes must use the transactional version-checked /save API. */
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const {response}=await requireAdminPermission(request,'pages','READ');
 if(response)return response;
 const {id}=await params;
 if(!uuid.test(id))return NextResponse.json({error:'Invalid page id'},{status:400});
 try {
  const result=await db.query('SELECT * FROM page_sections WHERE page_id=$1 ORDER BY position,id',[id]);
  const page=await db.query('SELECT content FROM pages WHERE id=$1',[id]);
  const draft=page.rows[0]?.content?.builder_draft;
  return NextResponse.json({items:draft?.sections||result.rows,page:draft?.page||null});
 } catch {return NextResponse.json({error:'Could not load sections'},{status:500});}
}

/** Disallow bypassing atomic save, revision history, published-page permission and conflict protection. */
export async function PUT(request:NextRequest) {
 const {response}=await requireAdminPermission(request,'pages','UPDATE');
 if(response)return response;
 return NextResponse.json({error:'Sections-only saving has been retired. Reload the editor and use Save page and sections so revisions and conflict protection are preserved.',code:'ATOMIC_SAVE_REQUIRED'},{status:409});
}
