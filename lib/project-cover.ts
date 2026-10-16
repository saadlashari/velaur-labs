import {projectGallery} from './project-gallery';
export function projectCover(content:unknown){
 const gallery=projectGallery(content);if(gallery[0])return gallery[0];
 if(content&&typeof content==='object'&&'artwork' in content&&typeof content.artwork==='string'&&/^\/portfolio\/[a-z0-9-]+\.svg$/.test(content.artwork))return {url:content.artwork,alt:'Project title artwork'};
 return null;
}
