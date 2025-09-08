import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'श्री ओपी चौधरी - सोशल मीडिया एनालिटिक्स डैशबोर्ड',
  description: 'सोशल मीडिया पोस्ट्स का विश्लेषण (देवनागरी)',
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
