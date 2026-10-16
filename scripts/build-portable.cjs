// Standard SWC build with filesystem compatibility for restricted Windows runners.
const path=require('node:path'),{spawnSync}=require('node:child_process');
 const compatibility=path.resolve('scripts/windows-fs-compat.cjs').replaceAll('\\','/');
 const options=[process.env.NODE_OPTIONS||'',process.platform==='win32'?`--require="${compatibility}"`:''].filter(Boolean).join(' ');
 const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build'],{stdio:'inherit',env:{...process.env,NODE_OPTIONS:options,VELAUR_PORTABLE_BUILD:'1'},windowsHide:true});
 process.exitCode=result.status??1;
