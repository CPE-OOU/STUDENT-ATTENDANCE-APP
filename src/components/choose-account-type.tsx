'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar } from './ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';

const FormSchema = z.object({
  type: z.enum(['student', 'teacher']),
});

interface ChooseAccountTypeProps {
  onSelectAccountCreateType: (data: z.infer<typeof FormSchema>) => void;
}

export function ChooseAccountType({
  onSelectAccountCreateType,
}: ChooseAccountTypeProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSelectAccountCreateType)}
        className="w-[509px] space-y-6 p-6 bg-[#F9F9F9]  rounded-3xl"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xl leading-normal text-[#3F3F44] font-normal text-center block mb-8">
                Choose your account type
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-y-6 mb-6"
                >
                  <FormItem className="flex items-center p-6 bg-white rounded-[16px]">
                    <FormLabel className="font-normal">
                      <div className="flex gap-x-[16px] items-center">
                        <div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/images/account.svg" />
                          </Avatar>
                        </div>
                        <div className="flex flex-col gap-y-1">
                          <h4 className="text-sm leading-normal font-semibold text-[#3F3F44]">
                            Lecturer account
                          </h4>
                          <p className="text-sm leading-6 font-light text-[#3F3F44]">
                            Amet minim mollit non deserunt
                          </p>
                        </div>
                      </div>
                    </FormLabel>
                    <FormControl className="ml-auto">
                      <RadioGroupItem value="teacher" />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex items-center p-6 bg-white rounded-[16px]">
                    <FormLabel className="font-normal">
                      <div className="flex gap-x-[16px] items-center">
                        <div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/images/account.svg" />
                          </Avatar>
                        </div>
                        <div className="flex flex-col gap-y-1">
                          <h4 className="text-sm leading-normal font-semibold text-[#3F3F44]">
                            Student account
                          </h4>
                          <p className="text-sm leading-6 font-light text-[#3F3F44]">
                            Amet minim mollit non deserunt
                          </p>
                        </div>
                      </div>
                    </FormLabel>
                    <FormControl className="ml-auto">
                      <RadioGroupItem value="student" />
                    </FormControl>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full disabled:opacity-20"
          disabled={!form.formState.isValid || form.formState.isLoading}
        >
          Continue
        </Button>
      </form>
    </Form>
  );
}
