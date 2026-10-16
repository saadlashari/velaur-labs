import {DEFAULT_SHARING_IMAGE,DEFAULT_SHARING_ALT} from '@/lib/sharing-image';
import type { Metadata } from 'next';
import './globals.css';
import './builder.css';
import './design.css';
import './light-theme.css';
import './public-ux.css';
import './admin-studio.css';
import './premium-theme.css';
import './agency-growth.css';
import './reference-redesign.css';
import './consistency-refinement.css';
import './website-changes-3.css';
import './process-arc.css';
import './website-changes-5.css';
import './seo-workspace.css';
import './interaction-polish.css';
import './process-alignment.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://velaurlabs.com'),
  title: {
    default: 'VELAUR LABS | Where Creativity Meets Technology',
    template: '%s | VELAUR LABS',
  },
  description: 'VELAUR LABS connects AI and software development, business development and digital marketing for agencies, e-commerce brands, startups and local businesses.',
  applicationName: 'VELAUR LABS',
  icons: {
    icon: [{ url: '/favicon-512.png', type: 'image/png', sizes: '512x512' }],
    shortcut: '/favicon-512.png',
    apple: [{ url: '/favicon-512.png', sizes: '512x512' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'VELAUR LABS',
    title: 'VELAUR LABS | Where Creativity Meets Technology',
    description: 'AI and software development, business development and digital marketing, connected for your next stage of growth.',
    url: 'https://velaurlabs.com',
    images: [{url:DEFAULT_SHARING_IMAGE,width:1200,height:630,alt:DEFAULT_SHARING_ALT}],
  },
  twitter:{card:'summary_large_image',images:[DEFAULT_SHARING_IMAGE]},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}



