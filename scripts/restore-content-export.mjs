#!/usr/bin/env node
/**
 * VELAUR CONTENT EXPORT v2 restore utility.
 * SAFE DEFAULT: validates JSON locally and does not connect to a database.
 * APPLY: merge-only UPSERT in one transaction; no deletes. Not a full PostgreSQL restore.
 */
import { readFileSync } from 'node:fs';
import { validateExport } from './verify-content-export.mjs';

const order = ['pages','page_sections','services','projects','media_assets','blog_posts','global_settings','inquiries','redirects'];
const ident = (value) => '"' + value.replaceAll('"','""') + '"';
const args=process.argv.slice(2);
const file=args.find(a=>!a.startsWith('--'));
const apply=args.includes('--apply');
const confirmed=args.includes('--confirm-merge');
const help=`Usage: node scripts/restore-content-export.mjs <export.json> [--apply --confirm-merge]\n\nDefault: OFFLINE validation and row summary; no database writes.\n--apply --confirm-merge: insert/update matching primary keys in DATABASE_URL, in one transaction.\nThis is MERGE-ONLY; it never deletes existing rows. Take a provider-level PostgreSQL backup first.`;
if(!file || args.includes('--help')) {console.log(help);process.exit(file?0:2)}
let doc;
try {doc=JSON.parse(readFileSync(file,'utf8'));} catch(e){console.error('Could not read JSON:',e.message);process.exit(1)}
const checked=validateExport(doc);
if(!checked.valid){console.error('Export integrity FAILED:',checked.errors.join('; '));process.exit(1)}
console.log('Export integrity PASS:', JSON.stringify(checked.counts));
if(!apply){console.log('DRY RUN ONLY: No database connection or writes made.');process.exit(0)}
if(!confirmed){console.error('Refusing database writes without BOTH --apply and --confirm-merge.');process.exit(2)}
if(!process.env.DATABASE_URL){console.error('DATABASE_URL is missing');process.exit(2)}
const { default: pg } = await import('pg');
const client = new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
let began=false;
try{
 await client.connect();
 await client.query('BEGIN');began=true;
 await client.query(`SET LOCAL lock_timeout = '8s'`);
 await client.query(`SET LOCAL statement_timeout = '45s'`);
 // Avoid simultaneous content restores from independent operators.
 await client.query('SELECT pg_advisory_xact_lock($1)',[18429017]);
 for(const table of order){
  const rows=doc.tables[table]; if(!rows.length){console.log(`${table}: 0`);continue;}
  const schema=await client.query(`SELECT column_name,is_generated FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,[table]);
  if(!schema.rowCount)throw Error(`Target table not found: ${table}`);
  const permitted=new Set(schema.rows.filter(r=>r.is_generated==='NEVER').map(r=>r.column_name));
  const pkResult=await client.query(`SELECT att.attname AS column_name FROM pg_index ind JOIN pg_class cls ON cls.oid=ind.indrelid JOIN pg_namespace ns ON ns.oid=cls.relnamespace JOIN pg_attribute att ON att.attrelid=cls.oid AND att.attnum=ANY(ind.indkey) WHERE ind.indisprimary AND ns.nspname='public' AND cls.relname=$1`,[table]);
  const pk=pkResult.rows.map(r=>r.column_name);
  if(pk.length!==1)throw Error(`Expected single-column PK for ${table}`);
  const columns=Object.keys(rows[0]);
  if(!columns.length||columns.some(c=>!permitted.has(c))||!columns.includes(pk[0]))throw Error(`Export/schema column mismatch for ${table}`);
  if(rows.some(row=>Object.keys(row).length!==columns.length || columns.some(c=>!(c in row))))throw Error(`Inconsistent exported row shape in ${table}`);
  const sqlColumns=columns.map(ident).join(',');
  const updates=columns.filter(c=>c!==pk[0]).map(c=>`${ident(c)}=EXCLUDED.${ident(c)}`).join(',');
  const query=`INSERT INTO ${ident(table)} (${sqlColumns}) VALUES (${columns.map((_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT (${ident(pk[0])}) ${updates?'DO UPDATE SET '+updates:'DO NOTHING'}`;
  for(const row of rows){await client.query(query,columns.map(c=>row[c]!==null&&typeof row[c]==='object'?JSON.stringify(row[c]):row[c]));}
  console.log(`${table}: merged ${rows.length}`);
 }
 await client.query('COMMIT');began=false;
 console.log('MERGE COMMITTED. Existing non-exported records were retained.');
}catch(error){if(began)await client.query('ROLLBACK').catch(()=>{});console.error('RESTORE FAILED / ROLLED BACK:',error.message);process.exitCode=1}
finally{await client.end().catch(()=>{})}
