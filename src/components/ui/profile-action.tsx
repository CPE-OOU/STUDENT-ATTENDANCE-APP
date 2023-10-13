import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import Image from 'next/image';
import { ClientUser } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import { routeIsActive } from '@/lib/utils';
interface ProfileActionProps {
  user: ClientUser;
}

export const ProfileAction: React.FC<ProfileActionProps> = ({
  user: { imageUrl, firstName, lastName, type },
}) => {
  const pathName = usePathname();
  const accountPathActive = routeIsActive({
    currentRoute: '/account',
    activeRoute: pathName,
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
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
      <DropdownMenuContent>
        {!accountPathActive ? (
          <>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem>Change Email</DropdownMenuItem>
        <DropdownMenuItem>Change Password</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
