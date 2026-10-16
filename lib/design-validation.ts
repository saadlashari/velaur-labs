import {validSharingImageUrl} from './sharing-image';
import {validSeoOverrides} from './seo-catalog';
import {validProcessDetails,validFooterGroups,validSocialUrl,socialDomains} from '@/lib/site-expansion';
import {brandIconKeys} from '@/lib/brand-icons';
import {validCapabilities,validPresentation} from './home-presentation';
import {validateElementDesign} from '@/lib/element-design';
import {validHomeSectionStyles} from './home-section-styles';
import {parseHomeLayout,HOME_SECTION_KEYS} from './home-layout';
const allowed = ['social_image_url','social_image_alt','seo_pages','home_process_details','footer_service_groups','tiktok_url','youtube_url','pinterest_url','inner_hero_visuals_enabled','home_capability_groups','home_presentation','header_enabled','footer_enabled','topbar_enabled','topbar_text','topbar_url','element_overrides','blog_hero_eyebrow','blog_hero_title','blog_hero_highlight','blog_hero_copy','blog_empty_title','blog_empty_copy','privacy_hero_copy','privacy_contact_copy','terms_hero_copy','terms_contact_copy','services_hero_eyebrow','services_hero_title','services_hero_highlight','services_hero_copy','services_group_ai','services_group_software','services_group_design','work_hero_eyebrow','work_hero_title','work_hero_highlight','work_hero_copy','work_published_title','work_empty_title','work_empty_copy','contact_hero_eyebrow','contact_hero_title','contact_hero_highlight','contact_hero_copy','contact_form_title','contact_form_intro','contact_side_title','contact_side_intro','contact_next_copy','about_hero_title','about_hero_copy','about_story_title','about_story_lead','about_story_body','about_mission_title','about_mission_copy','about_vision_title','about_vision_copy','about_principles_title','about_principles','about_cta_title','about_cta_copy','home_services_title','home_services_intro','home_work_title','home_work_intro','home_process_title','home_process_intro','home_why_title','home_why_intro','home_blog_title','home_blog_intro','home_cta_title','home_cta_intro','home_layout','home_section_styles','home_featured_services','home_process_steps','home_why_reasons','home_featured_project_slugs','contact_email','whatsapp_number','calendly_url','linkedin_url','instagram_url','facebook_url','hero_eyebrow','hero_headline','hero_description','footer_description','footer_location','nav_cta_label','nav_cta_url','primary_color','accent_color','dark_bg_color','light_bg_color','header_menu','services_menu','footer_columns','footer_services','light_text_color','dark_text_color','float_enabled','float_action','float_url','float_icon','float_svg_url','float_side','float_size','float_bottom','float_offset','float_bg','float_fg','float_border','float_radius','float_glow','float_tooltip','float_pages','body_font_size','section_spacing','header_height','footer_font_size','content_max_width','inner_heading_size','inner_body_size','inner_section_spacing','inner_card_radius'] as const;
function valid(key:string,value:unknown){
 if(key==='social_image_url')return validSharingImageUrl(value);
 if(key==='social_image_alt')return typeof value==='string'&&value.trim().length>0&&value.length<=250&&!/[<>\u0000-\u0008]/.test(value);
 if(key==='seo_pages'){if(typeof value!=='string'||value.length>200000)return false;try{return validSeoOverrides(JSON.parse(value));}catch{return false;}}
 if(key==='element_overrides'){if(typeof value!=='string'||value.length>200000)return false;try{return !validateElementDesign(JSON.parse(value));}catch{return false;}}
 if(typeof value!=='string'||value.length>4000)return false;
 if(key==='home_process_details'){try{return validProcessDetails(JSON.parse(value));}catch{return false;}}
 if(key==='footer_service_groups'){try{return validFooterGroups(JSON.parse(value));}catch{return false;}}
 if(key in socialDomains)return validSocialUrl(key,value);
 if(key==='inner_hero_visuals_enabled')return ['true','false'].includes(value);
 if(key==='about_principles'){try{const a=JSON.parse(value);return Array.isArray(a)&&a.length===4&&a.every(x=>x&&typeof x.title==='string'&&x.title.trim().length>0&&x.title.length<=100&&typeof x.copy==='string'&&x.copy.trim().length>0&&x.copy.length<=400);}catch{return false;}}
 if(['blog_hero_eyebrow','blog_hero_title','blog_hero_highlight','blog_hero_copy','blog_empty_title','blog_empty_copy','privacy_hero_copy','privacy_contact_copy','terms_hero_copy','terms_contact_copy'].includes(key))return value.trim().length>0&&value.length<=(key.endsWith('_copy')?700:150);
 if(key.startsWith('contact_') && !['contact_email'].includes(key)){return value.trim().length>0 && value.length<=(key.endsWith('_copy')||key.endsWith('_intro')?600:150);}
 if((key.startsWith('services_')&&key!=='services_menu')||key.startsWith('work_'))return value.trim().length>0&&value.length<=(key.endsWith('_copy')?600:150);
 if(key.startsWith('about_'))return value.trim().length>0&&value.length<=(key.endsWith('_title')?150:1200);
 if(key.startsWith('home_')&& (key.endsWith('_title')||key.endsWith('_intro'))){return value.trim().length>0&&value.length<=(key.endsWith('_title')?150:500);}
 if(['hero_eyebrow','hero_headline','hero_description'].includes(key)){const limits:Record<string,number>={hero_eyebrow:110,hero_headline:150,hero_description:500};return value.trim().length>0&&value.length<=limits[key];}
 if(key==='home_capability_groups'){try{return validCapabilities(JSON.parse(value));}catch{return false;}}
 if(key==='home_presentation'){try{return validPresentation(JSON.parse(value));}catch{return false;}}
 if(key==='home_section_styles'){try{return validHomeSectionStyles(JSON.parse(value));}catch{return false;}}
 if(key==='home_layout') {try{const layout=JSON.parse(value);return Array.isArray(layout)&&layout.length===HOME_SECTION_KEYS.length&&JSON.stringify(parseHomeLayout(JSON.stringify(layout)))===JSON.stringify(layout)&&layout[0]?.key==='hero';}catch{return false;}}
 if(key==='home_featured_project_slugs'){try{const a=JSON.parse(value);return Array.isArray(a)&&a.length===4&&a.every((v:unknown)=>typeof v==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v))&&new Set(a).size===4;}catch{return false;}}
 if(key==='home_why_reasons'){try{const a=JSON.parse(value);return Array.isArray(a)&&a.length===6&&a.every(x=>x&&typeof x.title==='string'&&x.title.trim()&&x.title.length<=100&&typeof x.description==='string'&&x.description.trim()&&x.description.length<=350);}catch{return false;}}
 if(['home_featured_services','home_process_steps'].includes(key)){
  try{const a=JSON.parse(value);const keys=key==='home_featured_services'?['title','description','tags']:['title','description','deliverable'];const count=key==='home_featured_services'?3:5;
   return Array.isArray(a)&&a.length===count&&a.every(x=>x&&typeof x==='object'&&keys.every(k=>typeof x[k]==='string'&&x[k].trim().length>0&&x[k].length<=350));}catch{return false;}
 }
 if(['header_menu','services_menu','footer_columns','footer_services'].includes(key)){try{const v=JSON.parse(value);return Array.isArray(v)&&v.length<=(key==='services_menu'?32:16)&&v.every(x=>x&&typeof x.label==='string'&&x.label.length<=70&&typeof x.href==='string'&&/^\/[a-zA-Z0-9/_-]*$/.test(x.href)&&(!('icon' in x)||typeof x.icon==='string'&&brandIconKeys.includes(x.icon)));}catch{return false;}}
 if(['float_bg','float_fg','float_border'].includes(key))return /^#[0-9a-fA-F]{6}$/.test(value);
 if(['header_enabled','footer_enabled','topbar_enabled','float_enabled','float_glow'].includes(key))return ['true','false'].includes(value);
 if(key==='float_action')return ['whatsapp','call','email','url'].includes(value);
 if(key==='float_icon')return ['phone','message','mail','link'].includes(value);
 if(key==='float_side')return ['left','right'].includes(value);
 if(key==='float_pages')return value==='all'||value==='home'||value==='inner';
 if(['float_size','float_bottom','float_offset','float_radius'].includes(key))return /^\d{1,3}$/.test(value)&&Number(value)<=160;
 if(['body_font_size','section_spacing','header_height','footer_font_size','content_max_width','inner_heading_size','inner_body_size','inner_section_spacing','inner_card_radius'].includes(key)){const ranges:Record<string,[number,number]>={body_font_size:[14,22],section_spacing:[30,30],header_height:[58,110],footer_font_size:[12,19],content_max_width:[880,1600],inner_heading_size:[28,56],inner_body_size:[14,20],inner_section_spacing:[30,30],inner_card_radius:[0,40]};const n=Number(value);return /^\d{1,4}$/.test(value)&&Number.isInteger(n)&&n>=ranges[key][0]&&n<=ranges[key][1];}
 if(key==='float_svg_url'){if(!value)return true;try{const u=new URL(value);return u.protocol==='https:';}catch{return false;}}
 if(key==='float_url'){if(!value)return true;return /^(https:\/\/|tel:|mailto:)/.test(value);}
 if(key.endsWith('_color'))return /^#[0-9a-fA-F]{6}$/.test(value);
 if(key==='contact_email')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
 if(key==='whatsapp_number')return /^\+?[0-9 ]{8,20}$/.test(value);
 if(['nav_cta_url','topbar_url'].includes(key)&&/^\/[a-zA-Z0-9/_-]*$/.test(value))return true;
 if(key.endsWith('_url')){if(!value)return true;try{const u=new URL(value);return u.protocol==='https:';}catch{return false;}}
 return true;
}

export {allowed as designSettingKeys,valid as validDesignSetting};
