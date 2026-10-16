import type { Metadata } from 'next';
import AdminGate from './admin-gate';
import AdminShell from './admin-shell';

export const metadata: Metadata = {
  title: 'Admin Console',
  description: 'VELAUR LABS administration workspace.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminGate><AdminShell>{children}</AdminShell></AdminGate>;
}
