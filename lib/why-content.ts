export type WhyReason={title:string;description:string};
export const defaultWhyReasons:WhyReason[]=[
 {title:'AI-first thinking',description:'We look for practical ways intelligent technology can solve real business problems.'},
 {title:'Tailored solutions',description:'The approach starts with your needs, not a one-size-fits-all package.'},
 {title:'End-to-end delivery',description:'From planning and design through development, testing and deployment.'},
 {title:'Transparent collaboration',description:'Clear communication, shared visibility and agreed milestones.'},
 {title:'Scalable engineering',description:'Build with maintainability and future growth in mind.'},
 {title:'Quality & reliability',description:'Thoughtful testing and maintainable foundations are part of the process.'}
];
export function parseWhyReasons(raw:string):WhyReason[]{
 try{const data:unknown=JSON.parse(raw);if(Array.isArray(data)&&data.length===6&&data.every(v=>v&&typeof v.title==='string'&&v.title.trim()&&v.title.length<=100&&typeof v.description==='string'&&v.description.trim()&&v.description.length<=350))return data as WhyReason[];}catch{}
 return defaultWhyReasons;
}
