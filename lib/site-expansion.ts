import {serviceCategories} from './agency-navigation';
export const defaultProcessDetails=[
 ['Discuss your goals, audience and current challenges.','Review existing tools, content and practical constraints.','Agree priorities, responsibilities and success criteria.','Define the scope and the next delivery milestones.'],
 ['Map the user journey and information structure.','Explore visual direction and accessible interface patterns.','Plan the architecture, integrations and content requirements.','Review the proposed experience before implementation.'],
 ['Build the agreed features in manageable increments.','Connect approved systems and external integrations.','Review progress together and address feedback.','Document key decisions and prepare the working product.'],
 ['Check key journeys across mobile and desktop layouts.','Test validation, access controls and integration failures.','Review accessibility, content and loading behavior.','Resolve identified issues and confirm release readiness.'],
 ['Prepare the agreed environment and release configuration.','Complete launch checks and verify essential journeys.','Provide handover guidance and relevant documentation.','Agree monitoring, maintenance and future improvements.'],
];
export function validProcessDetails(value:unknown):value is string[][]{return Array.isArray(value)&&value.length===5&&value.every(points=>Array.isArray(points)&&points.length>=3&&points.length<=4&&points.every(point=>typeof point==='string'&&point.trim().length>0&&point.length<=180));}
export function parseProcessDetails(raw:string):string[][]{try{const value:unknown=JSON.parse(raw);return validProcessDetails(value)?value:defaultProcessDetails;}catch{return defaultProcessDetails;}}
export const defaultFooterGroups=[...serviceCategories.map(group=>({key:group.slug,label:group.title,visible:true})),{key:'growth-solutions',label:'Growth Solutions',visible:true}];
export function validFooterGroups(value:unknown):value is typeof defaultFooterGroups{return Array.isArray(value)&&value.length===4&&new Set(value.map(item=>item?.key)).size===4&&value.every(item=>item&&defaultFooterGroups.some(g=>g.key===item.key)&&typeof item.label==='string'&&item.label.trim().length>0&&item.label.length<=80&&typeof item.visible==='boolean');}
export function parseFooterGroups(raw:string){try{const value:unknown=JSON.parse(raw);return validFooterGroups(value)?value:defaultFooterGroups;}catch{return defaultFooterGroups;}}
export const socialDomains:Record<string,string[]>={linkedin_url:['linkedin.com'],instagram_url:['instagram.com'],facebook_url:['facebook.com','fb.com'],tiktok_url:['tiktok.com'],youtube_url:['youtube.com','youtu.be'],pinterest_url:['pinterest.com','pin.it']};
export function validSocialUrl(key:string,value:string){if(value==='')return true;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&Boolean(socialDomains[key]?.some(domain=>url.hostname===domain||url.hostname.endsWith('.'+domain)));}catch{return false;}}

export function reorderProcessPoints(before:unknown[],after:unknown[],points:string[][]):string[][]{const indices=after.map(step=>before.findIndex(old=>JSON.stringify(old)===JSON.stringify(step)));return indices.length===points.length&&indices.every(index=>index>=0)&&new Set(indices).size===points.length?indices.map(index=>points[index]):points;}
