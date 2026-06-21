import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { EventProvider } from '@/lib/event-context';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Taulamic',
  description: 'Distribución inteligente de mesas para eventos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans`}>
        <EventProvider>{children}</EventProvider>
      </body>
    </html>
  );
}
