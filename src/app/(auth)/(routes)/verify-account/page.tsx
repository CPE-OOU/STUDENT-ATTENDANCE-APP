'use client';
import { Banner } from '@/components/banner';
import { VerifyAccountForm } from './__component/verify-form';
import { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
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
          <div>{mounted ? <VerifyAccountForm /> : null}</div>
        </div>
      </div>
    </div>
  );
}
