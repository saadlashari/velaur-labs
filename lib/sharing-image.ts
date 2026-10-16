export const DEFAULT_SHARING_IMAGE='/brand/social-preview-premium.png';
export const DEFAULT_SHARING_ALT='VELAUR LABS — Your Digital Partner. Technology, business development and digital growth.';
export function validSharingImageUrl(value:unknown):value is string{
 if(typeof value!=='string'||value.length>2048||value!==value.trim())return false;
 if(value===DEFAULT_SHARING_IMAGE)return true;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.hash;}catch{return false;}
}
export function sharingImage(settings:{social_image_url?:string;social_image_alt?:string}){
 const url=validSharingImageUrl(settings.social_image_url)?settings.social_image_url:DEFAULT_SHARING_IMAGE;
 const alt=settings.social_image_alt?.trim()||DEFAULT_SHARING_ALT;
 return {url,alt,...(url===DEFAULT_SHARING_IMAGE?{width:1200,height:630}:{})};
}
