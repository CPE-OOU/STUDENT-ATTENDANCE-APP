import { BrandLogo } from '@/components/ui/logo';
import { SidebarRoutes } from './sidebar-routes';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const Sidebar = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect('/sign-in?callbackUrl=/dashboard');
  }

  if (user.type === null) {
    return redirect('/set-up');
  }

  return (
    <div className="h-full border-r flex flex-col items-center pl-10 pr-8 pt-14">
      <div className="mb-12">
        <BrandLogo />
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes user={user} />
      </div>
    </div>
  );
};
