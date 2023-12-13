'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
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

const FormSchema = z.object({
  courseCapturer: z.string({}).uuid(),
});

export function SelectCapturer({
  data,
  currentCapturerId,
}: {
  currentCapturerId?: string;
  data: {
    id: string;
    studentId: string | null;
    courseId: string | null;
    suspended: boolean | null;
    createdAt: Date | null;
    firstName: string;
    lastName: string;
    type: 'student' | 'teacher' | null;
    imageUrl: string | null;
    email: string;
  }[];
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="space-y-6">
        <FormField
          control={form.control}
          name="courseCapturer"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select the attendance capturer</FormLabel>
              <Popover>
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
                    <CommandInput placeholder="Search language..." />
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      {data.map((person) => (
                        <CommandItem
                          value={person.id}
                          key={person.id}
                          onSelect={() => {
                            form.setValue('courseCapturer', person.id);
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
                          {person.firstName} ${person.lastName}
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
