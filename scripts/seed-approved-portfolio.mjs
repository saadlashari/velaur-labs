import fs from 'node:fs';
const records=JSON.parse(fs.readFileSync(new URL('../data/portfolio.json',import.meta.url),'utf8'));
const apply=process.argv.includes('--apply'),publish=process.argv.includes('--publish-approved');
if(!apply){console.log(JSON.stringify({total:records.length,mode:'preview',records},null,2));process.exit(0);}
if(!process.env.DATABASE_URL)throw Error('Configure DATABASE_URL securely before applying.');
const {default:pg}=await import('pg');const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
await client.connect();let inserted=0;
try{
 await client.query('BEGIN');
 for(const p of records){const r=await client.query(`INSERT INTO projects(slug,title,category,page_type,summary,content,status,position,is_featured,live_url,figma_url,app_store_url,play_store_url,published_at) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,$13,CASE WHEN $7='PUBLISHED' THEN NOW() ELSE NULL END) ON CONFLICT(slug) DO NOTHING RETURNING id`,[p.slug,p.title,p.category,p.page_type,p.summary,JSON.stringify(p.content),publish?'PUBLISHED':'DRAFT',p.position,p.is_featured,p.live_url,p.figma_url,p.app_store_url,p.play_store_url]);inserted+=r.rowCount;}
 await client.query('COMMIT');console.log(JSON.stringify({total:records.length,inserted,status:publish?'PUBLISHED':'DRAFT',existingRecords:'unchanged',screenshots:'not fabricated'}));
}catch(error){await client.query('ROLLBACK');throw error;}finally{await client.end();}
