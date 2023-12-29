'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import Image from 'next/image';
import { ClientUser } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useModal } from '@/hooks/use-modal';
interface ProfileActionProps {
  user: ClientUser;
}

export const ProfileAction: React.FC<ProfileActionProps> = ({ user }) => {
  const { imageUrl, firstName, lastName, type, email } = user;
  const openModal = useModal(({ onOpen }) => onOpen);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex gap-x-4 items-center">
          <div>
            <Avatar className="bg-[#F7F7F7] w-16 h-16 rounded-full flex justify-center items-center">
              <AvatarImage
                className="w-14 h-14 rounded-full"
                src={imageUrl ?? undefined}
                alt="profile"
              />
              <AvatarFallback>
                <div className="relative w-14 h-14 rounded-full">
                  <Image
                    src="/icons/sample-profile.svg"
                    alt="profile"
                    fill
                    className="object-fill block"
                  />
                </div>
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col gap-y-2 items-start">
            <h4 className="text-sm font-medium leading-4 text-[#3F3F44] uppercase">{`${firstName} ${lastName}`}</h4>
            <p className="text-xs leading-3 capitalize">{type}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{firstName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Attedance</DropdownMenuItem>
          <DropdownMenuItem>Courses</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              console.log('Hi');
              openModal('take-capture', {
                user,
              });
            }}
          >
            Take Capture
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
