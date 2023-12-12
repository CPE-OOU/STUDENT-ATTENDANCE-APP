'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useModal } from '@/hooks/use-modal';

import { useMount } from '@/hooks/use-mouted';
import { Separator } from '../ui/separator';

import { useAction } from 'next-safe-action/hook';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceSchema } from '@/lib/validations/attendance';
import { TypeOf } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { createAttendance } from '@/actions/attendance';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export const CreateStudentAttendance = () => {
  const { type, opened, onClose } = useModal();
  const form = useForm({
    resolver: zodResolver(createAttendanceSchema),
  });
  const { execute, status } = useAction(createAttendance, {
    onSuccess: () => {
      toast.success('Attendance', {
        description: 'Attendance is created',
      });
      onClose();
    },
    onError: () => {
      toast.success('Attendance', {
        description: 'Attendance failed while creating',
      });
    },
  });

  const mounted = useMount();

  const modalData = useModal(({ data }) => data);
  if (
    !(
      mounted &&
      modalData?.createAttendanceData &&
      type === 'create-attendance'
    )
  )
    return null;
  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden pt-8 rounded-[4px!important]"
        style={{ borderRadius: 'none' }}
      >
        <DialogHeader className=" px-6">
          <DialogTitle className="text-2xl text-left font-bold leading-[160%] tracking-wide">
            Create Attendance
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-left">
            Changes made to your profile are visible to anyone viewing your
            profile
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="px-6 rounded-sm overflow-hidden space-y-6"></div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(({ topicTitle, expiredAfter }) => {
              const { courseId, lecturerAttendeeId } =
                modalData.createAttendanceData!;
              execute({
                topicTitle,
                expiredAfter,
                courseId,
                lecturerAttendeeId,
              });
            })}
          >
            <div className="p-6 space-y-4">
              <FormField
                name="topicTitle"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-epilogue font-semibold text-base text-neutral-80">
                      Course Week Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? undefined}
                        type="text"
                        placeholder="Enter your course week title"
                        className="placeholder:text-neutral-40 font-medium rounded-none px-4 py-3"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="expiredAfter"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-epilogue font-semibold text-base text-neutral-80">
                      Expires
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={(field.value as any) ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiration duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['15min', '30min', '1hr'].map((time) => (
                          <SelectItem value={time} key={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <Separator />
            <div className="flex justify-end p-6">
              <Button
                variant="primary"
                type="submit"
                className="px-6 py-3 ml-auto rounded-none"
              >
                Create
                <Loader2
                  className={cn(
                    'w-5 h-5 animate-spin hidden ml-2',
                    status === 'executing' && 'block'
                  )}
                />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
