'use client';

import { User } from '@/config/db/schema';
import { ClientUser } from '@/lib/auth';
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

interface RouteAccessGrant {
  user?: Partial<ClientUser> | null;
  children: React.ReactNode;
}

export const RouteAccessGrant: React.FC<RouteAccessGrant> = ({
  user,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!user) {
    return redirect(`/sign-in?${searchParams}`);
  }

  if (!user.email) {
    return redirect('/verify-account?mode=request&type=account-verify');
  }

  // if (
  //   user?.emailVerified &&
  //   user?.setting?.setupCompleted &&
  //   (user.student || user?.lecturer)
  // ) {
  //   router.replace('/dashboard');
  //   return null;
  // }

  // if(user )

  // //'/verify-account?mode=request&type=account-verify'

  // if (/^\/verify-account/.test(pathname)) {
  //   if (!user) {
  //     router.replace(`/sign-in?callbackUrl=/verify-account`);
  //     return null;
  //   }

  //   if (user.emailVerified) {
  //     router.replace('/dashboard');
  //     return null;
  //   }
  // }

  return <>{children}</>;
};
