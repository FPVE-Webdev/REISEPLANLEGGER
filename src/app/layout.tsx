import type { Metadata } from 'next';
import { Syne } from 'next/font/google';
import './globals.css';
import RootLayoutClient from './layout-client';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Trip Planner - Tromsø AI',
  description: 'Plan your perfect Tromsø adventure with AI-powered recommendations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={syne.variable}>
      <body className="font-sans antialiased">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
