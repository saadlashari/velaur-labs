import profiles from '@/data/agency-services.json';
import solutions from '@/data/growth-solutions.json';
export type ServiceProfile={slug:string;title:string;headline:string;description:string;detail:string;problems:string[];deliverables:string[];audience:string[];process:{title:string;description:string}[];faqs:{question:string;answer:string}[];related:string[]};
export type GrowthSolution=ServiceProfile&{services:string[]};
export const serviceProfiles=profiles as ServiceProfile[];
export const growthSolutions=solutions as GrowthSolution[];
export const getServiceProfile=(slug:string)=>serviceProfiles.find(item=>item.slug===slug);
