// Homepage content is independently editable without replacing the approved design.
export type FeaturedService = {title:string;description:string;tags:string};
export type ProcessStep = {title:string;description:string;deliverable:string};
export const defaultFeaturedServices:FeaturedService[] = [
 {title:'AI Development',description:'Purpose-built AI products that turn complex workflows into useful, intelligent experiences.',tags:'AI agents · RAG · Intelligent apps'},
 {title:'Web Development',description:'Fast, accessible websites and robust web applications designed around your business.',tags:'Websites · Platforms · Portals'},
 {title:'Mobile App Development',description:'Thoughtful mobile experiences built for the people who use them every day.',tags:'iOS · Android · Cross-platform'}
];
export const defaultProcessSteps:ProcessStep[] = [
 {title:'Discovery & Strategy',description:'We understand your goals, audience, priorities and project requirements.',deliverable:'Clear scope & priorities'},
 {title:'Design & Planning',description:'We map user journeys, design interfaces and plan technical architecture.',deliverable:'Experience & architecture'},
 {title:'Development & Integration',description:'We implement your product and connect the systems it needs.',deliverable:'Working software'},
 {title:'Testing & Quality Assurance',description:'We check usability, accessibility, performance and essential user journeys.',deliverable:'Release readiness'},
 {title:'Deployment & Support',description:'We launch your product, monitor its health and support future improvements.',deliverable:'Launch & ongoing care'}
];
export function parseHomepageItems<T extends Record<string,string>>(raw:string|undefined,defaults:T[],keys:(keyof T)[]):T[]{
 if(!raw)return defaults;
 try{const value:unknown=JSON.parse(raw);
  if(!Array.isArray(value)||value.length!==defaults.length)return defaults;
  if(!value.every(item=>item&&typeof item==='object'&&keys.every(k=>typeof item[k]==='string'&&item[k].trim().length>0&&item[k].length<=350)))return defaults;
  return value.map(item=>Object.fromEntries(keys.map(k=>[k,item[k]])) as T);
 }catch{return defaults;}
}
