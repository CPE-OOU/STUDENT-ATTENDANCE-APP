'use client';

import { ProfileAction } from '@/components/ui/profile-action';
import { ClientUser } from '@/lib/auth';
import { Bell, Mail } from 'lucide-react';
interface SideActionProps {
  user: ClientUser;
  sideAreaComponent?: React.ReactNode;
}

type SideAction = 'notifications' | 'meesages';

export const SideAction: React.FC<SideActionProps> = ({
  user,
  sideAreaComponent: SideAreaComponent,
}) => {
  return (
    <div className="flex flex-col gap-y-9 pt-[51px]  bg-[#F7F7F733] px-10 h-screen">
      <div className="flex justify-between items-center">
        <ProfileAction user={user} />
        <div className="flex gap-x-4">
          <span>
            <Mail className="text-[#747475] w-6 h-6" />
          </span>
          <span className="relative inline-block">
            <Bell className="text-[#747475] w-6 h-6" />
            <span className="inline-block absolute w-2 h-2 rounded-full bg-[#FDCB9E] right-[2px] top-0 z-[1]"></span>
          </span>
        </div>
      </div>
      <div>{SideAreaComponent}</div>
    </div>
  );
};
