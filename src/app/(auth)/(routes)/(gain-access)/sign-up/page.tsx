'use client';

import { Banner } from '@/components/banner';
import { SignUpForm } from './__components/form';
import Link from 'next/link';

export default function SignupPage() {
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
              One more <span className="font-bold text-black">step</span>,
              Choose your{' '}
              <span className="font-bold text-[#FDCB9E]">account</span> type
            </h2>
            <div className="mt-2 text-4 leading-6 font-medium">
              Already have an account?{' '}
              <Link
                href="/sign-in"
                className="text-primary font-bold underline block"
              >
                login
              </Link>
            </div>
          </div>
          <div>
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
