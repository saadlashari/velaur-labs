const builtInPages=new Set(['about','services','work','blog','contact','privacy-policy','terms-of-service']);
export function publicPagePath(slug:string){return slug==='home'||slug==='index'?'/':builtInPages.has(slug)?'/'+slug:'/pages/'+encodeURIComponent(slug);}
