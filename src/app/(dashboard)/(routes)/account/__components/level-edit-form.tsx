'use client';

import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { File, Loader2, Pencil, PlusCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TypeOf, object, string } from 'zod';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { studentProfileFormSchema } from '@/app/(setup)/(routes)/set-up/__validator/set-up-validator';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import { ClientUser } from '@/lib/auth';
import { toast } from 'sonner';

const formSchema = studentProfileFormSchema.pick({ level: true });

interface StudentLevelFormEditProps
  extends Partial<TypeOf<typeof formSchema>> {}
type StudentLevelFormEditData = TypeOf<typeof formSchema>;

export const StudentLevelFormEdit: React.FC<StudentLevelFormEditProps> = ({
  level,
}) => {
  const form = useForm<StudentLevelFormEditData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...(level && { level }) },
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
          type: 'level',
          value: formData.level,
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
        description: "An error occurred while update  student's level",
      });
    }
  });

  const toggleEdit = () => setActivelyEditing((editStatus) => !editStatus);
  return (
    <div className="border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        level
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
        <p className={cn('text-sm mt-2', !level && 'text-slate-500 italic')}>
          {level}
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
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
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting}>Save</Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
export { formSchema as lastNameEditFormSchema };
export type { StudentLevelFormEditData };
