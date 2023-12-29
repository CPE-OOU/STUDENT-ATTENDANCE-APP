import { universities } from './update-account-details/db';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { SetupComponentFnProps, useExternalSetupState } from './setup-client';
import { useEffect } from 'react';
import {
  StudentSetupProfileFormData,
  studentProfileFormSchema,
} from '../__validator/set-up-validator';

interface UpdateAccountDetailsProps extends SetupComponentFnProps {}

export const StudentUpdateAccountDetail: React.FC<
  UpdateAccountDetailsProps
> = ({ stepOption }) => {
  const { getStepData, setStepError, setStepState, user, setStepCompleted } =
    useExternalSetupState();
  const data = {
    department: user.student?.department ?? '',
    university: user.student?.university ?? '',
    ...(user.student?.level && { level: user.student.level }),
    ...(getStepData(stepOption.step) as any),
  } as StudentSetupProfileFormData;

  const form = useForm<StudentSetupProfileFormData>({
    resolver: zodResolver(studentProfileFormSchema),
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
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal">
                    University
                  </FormLabel>
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
                        <SelectValue placeholder="Select a fruit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <ScrollArea className="h-[340px] w-full">
                        <SelectGroup className="bg-white">
                          <SelectLabel className="mb-1">
                            Enter your university
                          </SelectLabel>
                          {universities.map(({ name }, i) => (
                            <SelectItem value={name} key={i} className="mb-3">
                              {name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal">
                    Department
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                      type="text"
                      defaultValue={field.value}
                      {...field}
                      placeholder="Enter your department...e.g Computer Engineering"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal">Level</FormLabel>
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
                        <SelectValue placeholder="Select department Level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup className="bg-white">
                        {['100', '200', '300', '400', '500', '700'].map(
                          (level, i) => (
                            <SelectItem
                              value={level.toString()}
                              key={i}
                              className="mb-2"
                            >
                              {level} level
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
