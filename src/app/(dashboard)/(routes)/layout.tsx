import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '../__components/sidebar';
import { SideAction } from './account/__components/side-action';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { RecentAttendance } from './dashboard/__components/recent-attendance';

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout: React.FC<DashboardLayoutProps> = async ({
  children,
}) => {
  const user = await getCurrentUser();
  const url = headers().get('referer');

  if (!user) {
    return redirect(url ?? '/');
  }

  return (
    <div className="flex h-full">
      <div className="flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <div className="w-[calc(100vw-18rem)] translate-x-72 flex ">
        <main className="h-full flex-1">{children}</main>
        <div className="flex-shrink-0 w-[480px]">
          <div className="flex-shrink-0 w-[480px] ">
            <SideAction
              user={user}
              sideAreaComponent={
                <div>
                  <RecentAttendance />
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
