import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL must be configured securely.');
const output=path.resolve(process.argv[2]||'private-backups');fs.mkdirSync(output,{recursive:true,mode:0o700});
const file=path.join(output,'velaur-full-'+new Date().toISOString().replace(/[:.]/g,'-')+'.dump');
// libpq reads the URI from the environment; the password is never a command argument.
const env={...process.env,PGDATABASE:process.env.DATABASE_URL};delete env.DATABASE_URL;
const dump=spawnSync('pg_dump',['--format=custom','--no-owner','--no-privileges','--file',file],{env,stdio:['ignore','ignore','ignore'],windowsHide:true});
if(dump.status!==0){if(fs.existsSync(file))fs.unlinkSync(file);throw Error('pg_dump failed or is unavailable. Check PostgreSQL tools and database access.');}
const verify=spawnSync('pg_restore',['--list',file],{env,stdio:'ignore',windowsHide:true});
if(verify.status!==0){fs.unlinkSync(file);throw Error('Archive validation failed. Incomplete backup removed.');}
const digest=createHash('sha256').update(fs.readFileSync(file)).digest('hex');fs.writeFileSync(file+'.sha256',digest+'  '+path.basename(file)+'\n',{mode:0o600});
console.log('Full PostgreSQL archive created and listing validated: '+file);
console.log('Copy it to encrypted storage, then test a restore in a disposable database. Listing verification alone does not prove recovery.');
