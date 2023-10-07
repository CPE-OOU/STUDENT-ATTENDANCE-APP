'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRegisterUser } from '@/mutations/useRegisterUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TypeOf, object, string } from 'zod';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface SignUpFormProps {
  accountType: 'student' | 'teacher';
}

const clientCreateNewUserValidator = object({
  firstName: string().min(1).max(64),
  lastName: string().min(1).max(64),
  email: string().email(),
  password: string().min(8),
  confirmPassword: string().min(8),
});

export function SignUpForm({ accountType }: SignUpFormProps) {
  const form = useForm<TypeOf<typeof clientCreateNewUserValidator>>({
    resolver: zodResolver(clientCreateNewUserValidator),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, data, mutate } = useRegisterUser();

  const isSubmitting = form.formState.isSubmitting;
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            mutate({ data, type: accountType })
          )}
          className="max-w-[507px] flex flex-col gap-y-[32px]"
        >
          <div className="flex gap-x-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="inline-block flex-grow-1 w-[100%]">
                  <FormLabel className="mb-4">FirstName</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      className="bg-[#F7F7F7] rounded-[8px] 
                    h-[56px] pl-[24px] py-[20px] text-[14px] font-normal flex-grow-1
                    "
                      placeholder="Enter your firstName"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="inline-block flex-grow-1 w-[100%]">
                  <FormLabel className="mb-4">lastName</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-[#F7F7F7] rounded-[8px] 
                   h-[56px] pl-[24px] py-[20px] text-[14px] font-normal  
                   "
                      disabled={isSubmitting}
                      placeholder="Enter your lastName"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
          <div className="flex gap-x-4">
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="inline-block flex-grow-1 w-[100%]">
                  <FormLabel className="mb-4">Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-[#F7F7F7] rounded-[8px] 
                   h-[56px] pl-[24px] py-[20px] text-[14px] font-normal
                   "
                      type={showPassword ? 'password' : 'text'}
                      disabled={isSubmitting}
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            variant="primary"
            className="w-full"
            disabled={!form.formState.isValid || isSubmitting}
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
