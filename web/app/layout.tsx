import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/shared/query-provider';
import { SessionProvider } from '@/components/shared/session-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: {
    default: 'Potrzebny.AI - Twoja platforma edukacyjna',
    template: '%s | Potrzebny.AI',
  },
  description:
    'Kompleksowa platforma edukacyjna z AI. Kursy, fiszki, quizy, panel pacjenta, panel lekarza i wiele więcej.',
  keywords: [
    'edukacja',
    'AI',
    'kursy online',
    'fiszki',
    'quizy',
    'terapia',
    'medycyna',
    'nauka',
  ],
  authors: [{ name: 'Potrzebny.AI' }],
  creator: 'Potrzebny.AI',
  publisher: 'Potrzebny.AI Sp. z o.o.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://potrzebny.ai',
    siteName: 'Potrzebny.AI',
    title: 'Potrzebny.AI - Twoja platforma edukacyjna',
    description:
      'Kompleksowa platforma edukacyjna z AI. Kursy, fiszki, quizy i wiele więcej.',
    images: [
      {
        url: 'https://potrzebny.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Potrzebny.AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Potrzebny.AI',
    description: 'Kompleksowa platforma edukacyjna z AI',
    images: ['https://potrzebny.ai/og-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
