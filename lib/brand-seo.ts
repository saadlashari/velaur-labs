import type {SiteSettings} from './site-settings';

const origin='https://velaurlabs.com';

// Read published social settings, just like the footer. Platform homepage
// placeholders are not claims of an official brand profile.
export function brandStructuredData(settings:Pick<SiteSettings,'facebook_url'|'instagram_url'|'linkedin_url'>){
  const sameAs=[settings.facebook_url,settings.instagram_url,settings.linkedin_url].filter(value=>{
    try{const url=new URL(value);return url.protocol==='https:'&&url.pathname.replace(/\//g,'').length>0;}catch{return false;}
  });
  return {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'WebSite','@id':`${origin}/#website`,url:`${origin}/`,name:'VELAUR LABS',alternateName:['VelaurLabs','Velaur Labs','velaurlabs.com'],publisher:{'@id':`${origin}/#organization`}},
      {'@type':'Organization','@id':`${origin}/#organization`,url:`${origin}/`,name:'VELAUR LABS',alternateName:'VelaurLabs',logo:{'@type':'ImageObject',url:`${origin}/favicon-512.png`,width:512,height:512},...(sameAs.length?{sameAs}:{})},
    ],
  };
}
