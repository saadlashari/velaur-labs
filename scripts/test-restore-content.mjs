import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const tables=['pages','page_sections','services','projects','blog_posts','global_settings','inquiries','media_assets','redirects'];
const rows=Object.fromEntries(tables.map(t=>[t,[]]));
rows.pages=[{id:'sample',title:'Example'}];
const counts=Object.fromEntries(tables.map(t=>[t,rows[t].length]));
const checksums=Object.fromEntries(tables.map(t=>[t,createHash('sha256').update(JSON.stringify(rows[t])).digest('hex')]));
const temp=mkdtempSync(join(tmpdir(),'velaur-restore-test-'));
const file=join(temp,'fixture.json');
try {
 writeFileSync(file,JSON.stringify({format:'VELAUR-CONTENT-EXPORT-v2',counts,checksums,tables:rows}));
 const run=(args)=>spawnSync(process.execPath,['scripts/restore-content-export.mjs',file,...args],{encoding:'utf8'});
 const dry=run([]);assert.equal(dry.status,0,dry.stderr);assert.match(dry.stdout,/DRY RUN ONLY/);
 const unsafe=run(['--apply']);assert.equal(unsafe.status,2);assert.match(unsafe.stderr,/Refusing database writes/);
 counts.pages=0;writeFileSync(file,JSON.stringify({format:'VELAUR-CONTENT-EXPORT-v2',counts,checksums,tables:rows}));
 const invalid=run([]);assert.equal(invalid.status,1);assert.match(invalid.stderr,/integrity FAILED/);
 console.log('Restore CLI: 3 safety tests passed (offline validation, confirmation gate, tamper rejection).');
}finally{rmSync(temp,{recursive:true,force:true})}
