/** Curated, accessible starter content for CMS sections. No fabricated portfolio claims. */
export const sectionTemplateTypes = ['HERO','TEXT','CARDS','PROJECTS','CTA','FAQ','IMAGE_TEXT','STATS','LAYOUT'] as const;
export type SectionTemplateType = typeof sectionTemplateTypes[number];
export type EditableSection = {section_key:string;section_type:string;is_visible:boolean;content:Record<string,unknown>;settings:Record<string,unknown>};
const definitions:Record<SectionTemplateType,{name:string;content:Record<string,unknown>;settings:Record<string,unknown>}>= {
 LAYOUT:{name:'Free-form nested layout',content:{blocks:[]},settings:{paddingTop:40,paddingBottom:40}},
 HERO:{name:'Hero / page introduction',content:{heading:'Build something meaningful',text:'Describe your offering, audience, and the next action.',buttonLabel:'Contact us',href:'/contact'},settings:{alignment:'left',headingSize:56,paddingTop:80,paddingBottom:80}},
 TEXT:{name:'Editorial content',content:{heading:'The story behind the work',text:'Add a clear, helpful explanation that gives visitors the context they need.'},settings:{maxWidth:900,paddingTop:64,paddingBottom:64}},
 CARDS:{name:'Service cards',content:{heading:'What we can help you build',text:'Explore our areas of expertise.',items:[{title:'AI Development',text:'Custom AI solutions built around practical business needs.',href:'/services/ai-development',linkLabel:'Explore service'},{title:'Web Development',text:'Modern websites and scalable applications.',href:'/services/web-development',linkLabel:'Explore service'},{title:'Mobile App Development',text:'Thoughtful experiences for mobile users.',href:'/services/mobile-app-development',linkLabel:'Explore service'}]},settings:{columns:3,cardRadius:18,cardGap:22}},
 PROJECTS:{name:'Project showcase',content:{heading:'Selected work',text:'Add approved case studies and genuine screenshots before publishing.',items:[{title:'Project title',text:'Describe the project and your role accurately.',href:'',linkLabel:'View case study',imageUrl:'',imageAlt:'',category:'Case study'}]},settings:{columns:2,cardRadius:16}},
 CTA:{name:'Contact call-to-action',content:{heading:'Ready to discuss your next project?',text:'Tell us about your goals and we will explore the next steps together.',buttonLabel:'Get in touch',href:'/contact'},settings:{alignment:'center',paddingTop:72,paddingBottom:72}},
 FAQ:{name:'Frequently asked questions',content:{heading:'Frequently asked questions',text:'Answers to common questions.',items:[{question:'How does a project begin?',answer:'We start with a discovery conversation to understand the problem, scope, and priorities.'},{question:'How do we discuss requirements?',answer:'Use our contact form to share your goals and any existing documentation.'}]},settings:{maxWidth:920}},
 IMAGE_TEXT:{name:'Image and story',content:{heading:'A closer look',text:'Pair a genuine project image with a helpful explanation.',imageUrl:'',imageAlt:''},settings:{imagePosition:'right',imageFit:'cover',imageRadius:20}},
 STATS:{name:'Metrics and results',content:{heading:'Results and impact',text:'Use only metrics you can substantiate.',items:[{value:'—',label:'Add a verified result'}]},settings:{columns:3,cardGap:20}}
};
export function makeSectionTemplate(type:SectionTemplateType,existingKeys:string[],now:number=Date.now()):EditableSection {
 const definition=definitions[type];let suffix=0;let key='section-'+now.toString(36)+'-'+type.toLowerCase();
 while(existingKeys.includes(key)){suffix++;key='section-'+now.toString(36)+'-'+type.toLowerCase()+'-'+suffix;}
 return {section_key:key,section_type:type,is_visible:true,content:structuredClone(definition.content),settings:structuredClone(definition.settings)};
}
export function duplicateEditableSection(section:EditableSection,existingKeys:string[],now:number=Date.now()):EditableSection{
 const copy=makeSectionTemplate(section.section_type as SectionTemplateType,existingKeys,now);
 return {...copy,content:structuredClone(section.content),settings:structuredClone(section.settings),is_visible:section.is_visible};
}
export const sectionTemplateOptions=sectionTemplateTypes.map(type=>({value:type,label:definitions[type].name}));
