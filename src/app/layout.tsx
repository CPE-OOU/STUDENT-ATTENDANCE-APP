import { QueryProvider } from '@/providers/query';
import './globals.css';
import type { Metadata } from 'next';
import createLocalFont from 'next/font/local';
import { ToastProvider } from '@/providers/toast';
import { getSession } from 'next-auth/react';
import { AuthSessionProvider } from '@/providers/session';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const font = createLocalFont({
  src: [
    {
      path: '../../public/fonts/WorkSans-Thin.woff2',
      style: 'normal',
      weight: '100',
    },
    {
      path: '../../public/fonts/WorkSans-ExtraLight.woff2',
      style: 'normal',
      weight: '200',
    },
    {
      path: '../../public/fonts/WorkSans-Light.woff2',
      style: 'normal',
      weight: '300',
    },
    {
      path: '../../public/fonts/WorkSans-Regular.woff2',
      style: 'normal',
      weight: '400',
    },
    {
      path: '../../public/fonts/WorkSans-Medium.woff2',
      style: 'normal',
      weight: '500',
    },
    {
      path: '../../public/fonts/WorkSans-SemiBold.woff2',
      style: 'normal',
      weight: '600',
    },
    {
      path: '../../public/fonts/WorkSans-Bold.woff2',
      style: 'normal',
      weight: '700',
    },
  ],
});

export const metadata: Metadata = {
  title: 'Student Attendance',
  description: 'Capture student attendance using modern technology',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = await getCurrentUser();

  if (user) {
    if (!user.emailVerified) {
      return redirect('/verify-account?mode=request&type=account-verify');
    }

    if (
      !user.setting.setupCompleted ||
      (user.setting.setupCompleted && !(user.student || user.lecturer))
    ) {
      return redirect('/set-up');
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ToastProvider />
        <QueryProvider>
          <AuthSessionProvider session={session}>
            {children}
          </AuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
