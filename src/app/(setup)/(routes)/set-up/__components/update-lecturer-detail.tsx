import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SetupComponentFnProps, useExternalSetupState } from './setup-client';
import { useEffect } from 'react';
import {
  LecturerProfileFormData,
  lecturerProfileFormSchema,
} from '../__validator/set-up-validator';
import { formOfAddress, professionTitle } from '@/config/db/schema/enums';

interface LecturerUpdateAccountDetailsProps extends SetupComponentFnProps {}

export const LecturerUpdateAccountDetail: React.FC<
  LecturerUpdateAccountDetailsProps
> = ({ stepOption }) => {
  const { getStepData, setStepError, setStepState, setStepCompleted } =
    useExternalSetupState();
  const data = {
    ...(getStepData(stepOption.step) as any),
  } as LecturerProfileFormData;

  const form = useForm<LecturerProfileFormData>({
    resolver: zodResolver(lecturerProfileFormSchema),
    defaultValues: data,
  });

  useEffect(() => {
    if (form.formState.isLoading) {
      setStepError(stepOption.step, !form.formState.isValid);
    }
  }, [form.formState.isLoading]);

  useEffect(() => {
    return () => {
      setStepState(stepOption.step, form.getValues(), true);
      setStepError(stepOption.step, !form.formState.isValid);
      setStepCompleted(stepOption.step, {
        completed: form.formState.isValid,
      });
    };
  }, [form.formState.isValid]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-[58px]">
        <h3
          className="text-2xl leading-normal
               text-[#3F3F444D] font-semibold text-center block mb-8"
        >
          Complete your account details
        </h3>
      </div>
      <div className="mx-auto">
        <Form {...form}>
          <form
            className="w-[480px] flex flex-col gap-y-8"
            onSubmit={form.handleSubmit((data) => {
              setStepState(stepOption.step, data);
              setStepCompleted(stepOption.step, {
                completed: true,
                submitTriggerred: true,
              });
            })}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="bg-zinc-300/50 border-0 
                        focus:ring-0 text-black ring-offset-0 focus:ring-offset-0
                        outline-none"
                      >
                        <SelectValue placeholder="Select a title" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white w-fit">
                      {professionTitle.enumValues.map((title) => (
                        <SelectItem
                          value={title}
                          key={title}
                          className="capitalize p-0 py-2 pl-2"
                        >
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-rose-600" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="formOfAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form of address</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="bg-zinc-300/50 border-0 
                        focus:ring-0 text-black ring-offset-0 focus:ring-offset-0
                        outline-none"
                      >
                        <SelectValue placeholder="Select a form of address" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white w-fit">
                      {formOfAddress.enumValues.map((address) => (
                        <SelectItem
                          value={address}
                          key={address}
                          className="capitalize p-0 py-2 pl-2"
                        >
                          {address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-rose-600" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>years of experience</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                      {...field}
                      type="number"
                      step={1}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600" />
                </FormItem>
              )}
            />
            <div>
              <Button variant="primary" type="submit" className="w-full">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
