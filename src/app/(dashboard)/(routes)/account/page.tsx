import { getCurrentUser } from '@/lib/auth';
import { SideAction } from './__components/side-action';
import { redirect } from 'next/navigation';
import { StudentUpdateForm } from './__components/student-update-account';
import { LecturerUpdateForm } from './__components/lecturer-update-account';
import { UpdateProfileImage } from './__components/update-profile-image';
import { AddressFormEdit } from './__components/address-form';
import { db } from '@/config/db/client';
import { addresses } from '@/config/db/schema';
import { eq } from 'drizzle-orm';
import { ScrollArea } from '@/components/ui/scroll-area';

const MyAccountPage = async () => {
  const user = await getCurrentUser();
  if (!user) return redirect(`/sign-in?callbackUrl=/account`);
  const [address] = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, user.id));
  return (
    <div className="flex pl-10  h-full">
      <ScrollArea className="flex-auto pr-8">
        <div className="flex flex-col items-start">
          <h3
            className="text-2xl font-semibold 
          text-[#3F3F44] leading-[18px] capitalize pt-[65px]"
          >
            My Account
          </h3>
        </div>

        <div className="mt-[50px] flex flex-col">
          <div className="mb-6 text-base font-semibold capitalize leading-[18px]">
            General
          </div>
          <div className="flex gap-x-4">
            <div className="flex-shrink-0">
              <UpdateProfileImage currentProfileImgUrl={user.imageUrl} />
            </div>
            <div className="flex-auto">
              {user.type === 'student' ? (
                <StudentUpdateForm user={user} />
              ) : (
                <LecturerUpdateForm user={user} />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-y-6  w-full mt-12 mb-[51px]">
            <div className="text-base font-semibold leading-5">
              Other Information
            </div>
            <AddressFormEdit address={address as any} />
          </div>
        </div>
      </ScrollArea>
      <div className="flex-shrink-0 w-[480px]">
        <SideAction user={user} />
      </div>
    </div>
  );
};

export default MyAccountPage;
