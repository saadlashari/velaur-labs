/** Verify file signatures before sending images to storage; MIME values are client controlled. */
export async function isRasterImage(file:File):Promise<boolean>{
 const b=new Uint8Array(await file.slice(0,32).arrayBuffer());
 if(file.type==='image/png')return b.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
 if(file.type==='image/jpeg')return b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255;
 const ascii=(from:number,to:number)=>String.fromCharCode(...b.slice(from,to));
 if(file.type==='image/webp')return ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP';
 if(file.type==='image/avif')return ascii(4,8)==='ftyp'&&['avif','avis'].includes(ascii(8,12));
 return false;
}
