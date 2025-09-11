import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Dhruv Dashboard',
  description: 'Functional dashboard in Hindi (Devanagari)',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dhruv.vercel.app'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
