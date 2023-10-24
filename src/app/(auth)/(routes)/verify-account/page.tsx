import { Banner } from '@/components/banner';
import { VerifyAccountForm } from './__component/verify-form';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
  VerifyAccountSearchParams,
  verifyAccountSearchParams,
} from '@/lib/validations/params';
import { db } from '@/config/db/client';
import { authTokens } from '@/config/db/schema';
import { sql } from 'drizzle-orm';

interface VerifyEmailPageProps {
  searchParams: VerifyAccountSearchParams;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const user = (await getCurrentUser())!;
  let params: typeof searchParams;
  try {
    params = verifyAccountSearchParams.parse(searchParams);
  } catch (e) {
    params = { type: 'account-verify' };
  }

  const { mode, type } = params;
  await db
    .delete(authTokens)
    .where(
      sql`${authTokens.expiresIn} < CURRENT_TIMESTAMP AND ${authTokens.userId} = ${user.id}`
    );

  return (
    <div className="p-6 flex h-full w-full gap-x-[72px] rounded-3xl">
      <Banner
        title="Learn How to Create a Course in Advance!"
        description="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint."
      />
      <div className="h-full flex flex-col justify-center flex-grow">
        <div className="flex flex-col gap-y-[32px]">
          <div className="max-w-[559px]">
            <h2 className="text-[#3F3F44] text-5xl leading-[72px] font-light ">
              <span className="font-bold text-black">Email</span> Verification
            </h2>
            <div className="mt-2 text-4 leading-6 font-medium">
              Please enter the verification code we sent to your email address
            </div>
          </div>
          <VerifyAccountForm
            autoRequestToken={mode === 'request'}
            type={type}
          />
        </div>
      </div>
    </div>
  );
}
