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
  { icon: Book, label: 'My Course', href: '/teacher/analytics' },
  { icon: User, label: 'My Accounts', href: '/teacher/analytics' },
  { icon: List, label: 'Dashboard', href: '/teacher/courses' },
];

const lecturerRoutes = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BarChartBig, label: 'Attendance', href: '/teacher/analytics2' },
  { icon: Book, label: 'My Course', href: '/courses' },
  { icon: Database, label: 'Database', href: '/students' },
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
