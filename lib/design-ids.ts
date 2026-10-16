function hash(value:string){let n=2166136261;for(let i=0;i<value.length;i++){n^=value.charCodeAt(i);n=Math.imul(n,16777619);}return (n>>>0).toString(16).padStart(8,'0');}
export function designId(base:string,key?:unknown){return 'd-'+hash(base)+(key===undefined?'':'-'+hash(String(key)));}
