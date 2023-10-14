'use client';

import { User } from '@/config/db/schema';
import { usePathname, useRouter } from 'next/navigation';

interface RouteAccessGrant {
  user?: Partial<User> | null;
  children: React.ReactNode;
}

export const RouteAccessGrant: React.FC<RouteAccessGrant> = ({
  user,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  if (/^\/sign-in|sign-up/.test(pathname) && user) {
    router.replace('/dashboard');
    return null;
  }

  if (/^\/verify-account/.test(pathname)) {
    if (!user) {
      router.replace(`/sign-in?callbackUrl=/verify-account`);
      return null;
    }

    if (user.emailVerified) {
      router.replace('/dashboard');
      return null;
    }
  }

  return <>{children}</>;
};
