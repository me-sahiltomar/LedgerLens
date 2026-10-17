import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LedgerLens — AI Vision Document Intelligence & Validation',
  description:
    'Multi-provider AI vision document intelligence, financial schema validation, and human-in-the-loop recalibration — A CevonX Product',
  applicationName: 'LedgerLens',
  authors: [{ name: 'CevonX Systems' }],
  keywords: [
    'LedgerLens',
    'CevonX',
    'Document Intelligence',
    'Vision AI',
    'Invoice Extraction',
    'Receipt Validation',
    'Financial Schema',
    'Auditing',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};

import { AuthProvider } from '@/lib/auth/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
