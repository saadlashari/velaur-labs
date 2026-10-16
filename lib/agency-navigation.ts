export const serviceCategories=[
 {slug:'ai-software-development',title:'AI & Software Development',description:'Plan, design, build and support useful digital products with the existing VELAUR LABS engineering team.',audience:'Startups, software houses, digital agencies and teams improving existing products.'},
 {slug:'business-development',title:'Business Development',description:'Build a practical route from your ideal customer profile to qualified conversations and a well-managed sales pipeline.',audience:'Software houses, agencies, B2B businesses and independent service providers.'},
 {slug:'digital-marketing-growth',title:'Digital Marketing & Growth',description:'Connect positioning, acquisition channels, content and conversion journeys around your business goals.',audience:'E-commerce brands, startups, agencies and local businesses.'},
] as const;
export type ServiceCategorySlug=typeof serviceCategories[number]['slug'];
export const newServiceNavigation=[
 ['b2b-lead-generation','B2B Lead Generation','business-development'],
 ['linkedin-outreach','LinkedIn Outreach','business-development'],
 ['cold-email-outreach','Cold Email Outreach','business-development'],
 ['appointment-setting','Appointment Setting','business-development'],
 ['upwork-profile-bidding-management','Upwork Profile & Bidding Management','business-development'],
 ['crm-sales-automation','CRM & Sales Automation','business-development'],
 ['meta-ads-management','Meta Ads Management','digital-marketing-growth'],
 ['google-ads-management','Google Ads Management','digital-marketing-growth'],
 ['email-marketing-automation','Email Marketing & Automation','digital-marketing-growth'],
 ['social-media-management','Social Media Management','digital-marketing-growth'],
 ['seo-content-marketing','SEO & Content Marketing','digital-marketing-growth'],
 ['landing-pages-conversion-rate-optimization','Landing Pages & Conversion Rate Optimization','digital-marketing-growth'],
 ['branding-creative-strategy','Branding & Creative Strategy','digital-marketing-growth'],
] as const;
export const originalServiceNavigation=[['ai-development','AI Development'],['web-development','Web Development'],['mobile-app-development','Mobile App Development'],['ai-automation','AI Automation'],['ai-integration','AI Integration'],['ui-ux-design','UI/UX Design'],['software-testing','Software Testing & QA'],['deployment-maintenance','Deployment & Maintenance']] as const;
export const allServiceNavigation=[...originalServiceNavigation.map(([slug,title])=>({slug,title,category:'ai-software-development' as ServiceCategorySlug})),...newServiceNavigation.map(([slug,title,category])=>({slug,title,category}))];
export const solutionNavigation=[
 ['b2b-client-acquisition-system','B2B Client Acquisition System'],['e-commerce-growth-system','E-commerce Growth System'],['startup-launch-system','Startup Launch System'],['ai-powered-business-automation','AI-Powered Business Automation'],['agency-freelancer-growth-system','Agency & Freelancer Growth System'],
] as const;
export const categoryForService=(slug:string):ServiceCategorySlug=>allServiceNavigation.find(item=>item.slug===slug)?.category||'ai-software-development';
export const inquiryServiceOptions=[...allServiceNavigation.map(item=>item.title),...solutionNavigation.map(([,title])=>title),...serviceCategories.map(item=>item.title),'Other'];
