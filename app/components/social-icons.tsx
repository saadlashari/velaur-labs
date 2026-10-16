import Image from 'next/image';
import {Mail} from 'lucide-react';
const brands=['facebook','instagram','linkedin','whatsapp','youtube','pinterest','tiktok'];
export default function SocialIcon({name}:{name:string}){
 if(brands.includes(name))return <Image className="social-brand-png" src={`/social-icons/${name}.png`} alt="" aria-hidden="true" width={24} height={24} unoptimized/>;
 return <Mail width={20} height={20} aria-hidden="true"/>;
}
