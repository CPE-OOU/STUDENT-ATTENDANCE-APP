'use client';

import { Banner } from '@/components/banner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TypeOf, object, string } from 'zod';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useGlobalState } from '@/hooks/use-global-state';

const formSchema = object({
  email: string().email(),
  password: string().min(8),
});

type SigninFormData = TypeOf<typeof formSchema>;
export default function SigninPage() {
  const form = useForm<SigninFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const { callbackUrl } = useSearchParams() as { callbackUrl?: string };
  const { authRedirectUrl, setRedirectUrl } = useGlobalState(
    ({ authRedirectUrl, setRedirectUrl }) => ({
      authRedirectUrl,
      setRedirectUrl,
    })
  );

  const [showPassword] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isSubmitting = form.formState.isSubmitting;

  useLayoutEffect(() => {
    if (callbackUrl) {
      setRedirectUrl(callbackUrl);
      router.push(pathname);
    }
  }, []);

  async function onSubmit(data: SigninFormData) {
    try {
      await signIn('credentials', data);
      toast.success('Welcome back. Login successful', { duration: 3000 });
      let redirectUrl = authRedirectUrl ?? '/dashboard';
      return setTimeout(() => {
        router.push(redirectUrl);
      }, 2000);
    } catch (e) {
      console.log(e);
      if (Object(e) === e && e instanceof Error) {
        if (!/internal/i.test(e.message)) {
          toast.error('Failed sign in', {
            duration: 3000,
            description: e.message,
          });
        }
      }
      toast.error('Failed sign in', {
        description: 'Something went wrong while signing user in',
      });
    }
  }

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
              Not registered yet?{' '}
              <Link
                href="/sign-up"
                className="text-primary font-bold underline block"
              >
                signup
              </Link>
            </div>
          </div>
          <div>
            <Form {...form}>
              <form
                className="max-w-[507px] flex flex-col gap-y-[32px]"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-4">Email</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-[#F7F7F7] rounded-[8px] 
                   h-[56px] pl-[24px] py-[20px] text-[14px] font-normal
                   "
                          type="email"
                          disabled={isSubmitting}
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="inline-block flex-grow-1 w-[100%]">
                      <FormLabel className="mb-4">Password</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-[#F7F7F7] rounded-[8px] 
                   h-[56px] pl-[24px] py-[20px] text-[14px] font-normal
                   "
                          type={showPassword ? 'password' : 'text'}
                          disabled={isSubmitting}
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={!form.formState.isValid || isSubmitting}
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}