'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAction } from 'next-safe-action/hook';
import { setCapturer } from '@/actions/attendance';
import { useState } from 'react';
import { toast } from 'sonner';

const FormSchema = z.object({
  courseCapturer: z.string({}).uuid(),
});

export function SelectCapturer({
  data,
  currentCapturerId,
  courseId,
  attendanceId,
}: {
  currentCapturerId?: string;
  data: {
    id: string;
    studentId: string;
    courseId: string | null;
    suspended: boolean | null;
    createdAt: Date | null;
    firstName: string;
    lastName: string;
    type: 'student' | 'teacher' | null;
    imageUrl: string | null;
    email: string;
  }[];

  courseId: string;
  attendanceId: string;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { courseCapturer: currentCapturerId! },
  });

  const {
    execute: setStudentCapturer,
    status,
    result,
  } = useAction(setCapturer, {
    onSuccess: (data) => {
      if (data) {
        toast.success('Capturer', {
          description: `${data.firstName} ${data.lastName} as being set to take capturing`,
        });
      } else {
        toast.error('Capturer', {
          description: 'An error occurred while setting capturer',
        });
      }
    },
    onError: () => {
      toast.error('Capturer', {
        description: 'An error occurred while setting capturer',
      });
    },
  });

  const [openModal, setOpenModal] = useState(false);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ courseCapturer }) => {
          setStudentCapturer({
            studentAttendeeId: courseCapturer,
            courseId,
            attendanceId,
          });
        })}
        className="flex items-center gap-x-4"
      >
        <FormField
          control={form.control}
          name="courseCapturer"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover open={openModal} onOpenChange={setOpenModal}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-[200px] justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? data.find(({ id }) => id === field.value)?.firstName
                        : 'Select a capturer'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search for student name" />
                    <CommandEmpty>
                      No Student with such name found.
                    </CommandEmpty>
                    <CommandGroup>
                      {data.map((person) => (
                        <CommandItem
                          value={person.id}
                          key={person.id}
                          onSelect={() => {
                            form.setValue('courseCapturer', person.id);
                            setOpenModal(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              person.id === field.value
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {person.firstName} {person.lastName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          Set
          {status === 'executing' && (
            <Loader2 className="w-5 h-5 animate-spin ml-2" />
          )}
        </Button>
      </form>
    </Form>
  );
}
