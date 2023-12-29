import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

export const useAccessMode = () => {
  const pathname = usePathname();
  const router = useRouter();
  // const session = useSession();

  // if (session.data?.user) {
  //   router.push('/sign-in');
  // }

  const teacherPageActive = pathname?.toLowerCase().startsWith('/teacher');
  const playerPageActive = pathname?.toLowerCase().startsWith('/chapter');

  return { teacherPageActive, playerPageActive };
};
