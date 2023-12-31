'use client';

import {
  BarChartBig,
  Book,
  Database,
  LayoutDashboard,
  List,
  LucideIcon,
  User,
} from 'lucide-react';
import { SidebarItem } from './sidebar-item';
import { ClientUser } from '@/lib/auth';
import { AccountSetting } from '@/config/db/schema';
interface Route {
  icon: LucideIcon;
  label: string;
  href: string;
}
const studentRoutes: Array<Route> = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BarChartBig, label: 'Attendance', href: '/attendances' },
  { icon: Book, label: 'My Course', href: '/courses' },
  { icon: User, label: 'My Accounts', href: '/account' },
];

const lecturerRoutes = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BarChartBig, label: 'Attendance', href: '/attendances' },
  { icon: Book, label: 'My Course', href: '/courses' },
  { icon: Database, label: 'Database', href: '/database' },
  { icon: User, label: 'My Accounts', href: '/account' },
];

interface SidebarRoutesProps {
  user: ClientUser & { setting?: AccountSetting | null };
}
export const SidebarRoutes: React.FC<SidebarRoutesProps> = ({ user }) => {
  const routes = user.type === 'student' ? studentRoutes : lecturerRoutes;
  return (
    <div className="flex flex-col w-full gap-y-4">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
