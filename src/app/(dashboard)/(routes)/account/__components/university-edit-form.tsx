'use client';

import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TypeOf } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { studentProfileFormSchema } from '@/app/(setup)/(routes)/set-up/__validator/set-up-validator';
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
import { universities } from '@/app/(setup)/(routes)/set-up/__components/update-account-details/db';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import { ClientUser } from '@/lib/auth';
import { toast } from 'sonner';

interface UniversityFormEditProps {
  university: string;
}

const formSchema = studentProfileFormSchema.pick({ university: true });

type UniversityFormEditData = TypeOf<typeof formSchema>;

export const UniversityFormEdit: React.FC<UniversityFormEditProps> = ({
  university,
}) => {
  const form = useForm<UniversityFormEditData>({
    resolver: zodResolver(formSchema),
    defaultValues: { university },
  });
  const router = useRouter();

  const [activelyEditing, setActivelyEditing] = useState(false);
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = form.handleSubmit(async (formData) => {
    try {
      const {
        data: { title, message },
      } = await axios.patch<SuccessServerResponsePayload<ClientUser>>(
        '/api/profile',
        {
          type: 'university',
          value: formData.university,
        }
      );
      router.refresh();
      toast.success(title, { description: message });
      setActivelyEditing(false);
    } catch (e) {
      if (Object(e) === e && e instanceof AxiosError) {
        const failedResponse = e.response?.data as FailedServerResponsePayload;
        toast.error(failedResponse.title, {
          description: failedResponse.message,
        });
      }

      toast.error('Failed to update record', {
        description: 'An error occurred while update university',
      });
    }
  });

  const toggleEdit = () => setActivelyEditing((editStatus) => !editStatus);
  return (
    <div className="border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        university
        <Button onClick={toggleEdit} variant="ghost">
          {activelyEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
            </>
          )}
        </Button>
      </div>
      {!activelyEditing ? (
        <p
          className={cn('text-sm mt-2', !university && 'text-slate-500 italic')}
        >
          {university}
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <div className="flex flex-col gap-y-4">
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
                        outline-none overflow-clip "
                        >
                          <SelectValue placeholder="Enter your university" />
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
              <Button disabled={!isValid || isSubmitting}>Save</Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
export { formSchema as lastNameEditFormSchema };
export type { UniversityFormEditData };
