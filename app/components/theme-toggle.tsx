'use client';
import {designId} from '@/lib/design-ids';

import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
import {usePathname} from 'next/navigation';
export default function ThemeToggle(){
 const pathname=usePathname();
 const [theme,setTheme]=useState<'dark'|'light'>('dark');
 useEffect(()=>{const sync=()=>{let chosen:'dark'|'light'='dark';try{chosen=window.localStorage.getItem('velaur-theme')==='light'?'light':'dark';}catch{}setTheme(chosen);document.querySelector('.public-site')?.setAttribute('data-theme',chosen);};sync();window.addEventListener('velaur-theme-change',sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener('velaur-theme-change',sync);window.removeEventListener('storage',sync);};},[pathname]);
 function toggle(){const next=theme==='dark'?'light':'dark';setTheme(next);try{window.localStorage.setItem('velaur-theme',next);}catch{}document.querySelector('.public-site')?.setAttribute('data-theme',next);window.dispatchEvent(new Event('velaur-theme-change'));}
 return <button data-design-id={designId("app/components/theme-toggle.tsx:611")} className="theme-toggle" aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'} title="Switch theme" type="button" onClick={toggle}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button>;
}
