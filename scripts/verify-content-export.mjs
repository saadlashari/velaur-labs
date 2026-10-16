#!/usr/bin/env node
// Validates a VELAUR v2 JSON content export; does not write to the database.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {pathToFileURL} from 'node:url';
const expected=['pages','page_sections','services','projects','blog_posts','global_settings','inquiries','media_assets','redirects'];
export function validateExport(doc) {
  const errors=[];
  if(!doc||typeof doc!=='object'||doc.format!=='VELAUR-CONTENT-EXPORT-v2')errors.push('Unsupported format');
  if(!doc?.tables||!doc.counts||!doc.checksums)errors.push('Missing tables or manifest');
  if(errors.length)return {valid:false,errors};
  const keys=Object.keys(doc.tables);
  if(keys.length!==expected.length||expected.some(k=>!keys.includes(k)))errors.push('Expected table list mismatch');
  for(const key of expected){
    const rows=doc.tables[key];
    if(!Array.isArray(rows)){errors.push(`${key}: missing rows`);continue;}
    if(key==='global_settings'&&rows.some(row=>typeof row?.setting_key==='string'&&/^(admin_|security_)/.test(row.setting_key)))errors.push('Security state cannot be restored through content exports. Use a full database recovery.');
    if(!Number.isInteger(doc.counts[key])||rows.length!==doc.counts[key])errors.push(`${key}: row count mismatch`);
    const hash=createHash('sha256').update(JSON.stringify(rows)).digest('hex');
    if(hash!==doc.checksums[key])errors.push(`${key}: checksum mismatch`);
  }
  return {valid:errors.length===0,errors,counts:doc.counts};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const file=process.argv[2];if(!file){console.error('Usage: node scripts/verify-content-export.mjs <export.json>');process.exit(2)}
  try{const output=validateExport(JSON.parse(readFileSync(file,'utf8')));console.log(JSON.stringify(output,null,2));if(!output.valid)process.exitCode=1}catch(e){console.error(`Invalid JSON: ${e instanceof Error?e.message:String(e)}`);process.exitCode=1}
}
