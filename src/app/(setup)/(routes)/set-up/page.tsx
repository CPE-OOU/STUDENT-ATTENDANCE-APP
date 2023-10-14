import { db } from '@/config/db/client';
import { accountSettings } from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import SetupClient from './__components/setup-client';
import { BrandLogo } from '@/components/ui/logo';

const SetupPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  if (!user.emailVerified) return redirect('/verify-account?mode=request');

  let [setting] = await db
    .select()
    .from(accountSettings)
    .where(eq(accountSettings.userId, user.id));

  if (!setting) {
    [setting] = await db
      .insert(accountSettings)
      .values({ userId: user.id })
      .returning();
  }

  if (setting.setupCompleted) {
    return redirect('/dashboard');
  }

  return (
    <div className="container px-[100px] py-[54px]">
      <div className="flex w-full mb-[40px]">
        <BrandLogo className="mr-auto" />
      </div>
      <div className="flex flex-col justify-center items-center">
        <SetupClient setting={setting} user={user} />
      </div>
    </div>
  );
};

export default SetupPage;
