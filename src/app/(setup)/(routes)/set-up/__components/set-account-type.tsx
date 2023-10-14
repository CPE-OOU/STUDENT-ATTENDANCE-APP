'use client';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SetupComponentFnProps, useExternalSetupState } from './setup-client';
import {
  SetupChooseAccountTypeFormData,
  setupChooseAccountTypeSchema,
} from '../__validator/set-up-validator';

interface PickAccountTypeProps extends SetupComponentFnProps {}

export function PickAccountType({ stepOption }: PickAccountTypeProps) {
  const { getStepData, setStepState, setStepCompleted } =
    useExternalSetupState();
  const { type } =
    (getStepData(stepOption.step) as SetupChooseAccountTypeFormData) ?? {};
  const form = useForm<SetupChooseAccountTypeFormData>({
    resolver: zodResolver(setupChooseAccountTypeSchema),
    defaultValues: { ...(type && { type }) },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ type }) => {
          if (type) {
            setStepState(stepOption.step, { type });
            setStepCompleted(stepOption.step, {
              completed: true,
              submitTriggerred: true,
            });
          }
        })}
        className="w-[509px] space-y-6"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel
                className="text-2xl leading-normal
               text-[#3F3F444D] font-semibold text-center block mb-8"
              >
                Select your account
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-y-6 mb-6"
                >
                  <FormItem className="flex items-center p-6 bg-[#F7F7F7] rounded-[16px]">
                    <FormLabel className="font-normal">
                      <div className="flex gap-x-[16px] items-center">
                        <div>
                          <Avatar
                            className="w-[60px] h-[60px] bg-white 
                          rounded-[12px] flex justify-center items-center"
                          >
                            <AvatarImage src="/icons/student.svg" />
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
                  <FormItem className="flex items-center p-6 bg-[#F7F7F7] rounded-[16px]">
                    <FormLabel className="font-normal">
                      <div className="flex gap-x-[16px] items-center">
                        <div>
                          <Avatar
                            className="w-[60px] h-[60px] bg-white 
                          rounded-[12px] flex justify-center items-center"
                          >
                            <AvatarImage
                              className="object-contain block"
                              src="/icons/lecturer.svg"
                            />
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
          className="w-full disabled:opacity-70"
          disabled={!form.formState.isValid || form.formState.isLoading}
        >
          Continue
        </Button>
      </form>
    </Form>
  );
}
