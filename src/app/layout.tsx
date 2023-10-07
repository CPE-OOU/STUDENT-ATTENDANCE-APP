import { QueryProvider } from '@/providers/query';
import './globals.css';
import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { ToastProvider } from '@/providers/toast';

const font = Work_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Student Attendance',
  description: 'Capture student attendance using modern technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <ToastProvider />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
