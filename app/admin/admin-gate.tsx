'use client';

import { createContext,useContext,useEffect,useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
type SessionUser={role:string;permissions:Record<string,string[]>;theme:string};
const SessionContext=createContext<SessionUser|null>(null);
export const useAdminUser=()=>useContext(SessionContext);

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === '/admin/login');
  const [user,setUser]=useState<SessionUser|null>(null);
  const validated=useRef(false);

  useEffect(() => {
    if (pathname === '/admin/login') {validated.current=false; setReady(true); return; }
    if(!validated.current)setReady(false);
    let active = true;
    fetch('/api/auth/me', { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) {validated.current=false;setReady(false); router.replace('/admin/login'); return; }
      const info = await response.json(); if (active) {validated.current=true;setUser(info.user); document.documentElement.dataset.adminTheme = info.user?.theme === 'light' ? 'light' : 'dark'; setReady(true); }
    }).catch(() => router.replace('/admin/login'));
    return () => { active = false; };
  }, [pathname, router]);

  if (!ready) return <main className="admin-gate-loading"><div><ShieldCheck size={28}/><strong>Verifying secure admin session…</strong><span>VELAUR LABS Admin Console</span></div></main>;
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}
