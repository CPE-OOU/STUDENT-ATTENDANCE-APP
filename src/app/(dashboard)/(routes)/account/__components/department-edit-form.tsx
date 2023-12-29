'use client';

import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import { toast } from 'sonner';
import { ClientUser } from '@/lib/auth';

interface DepartmentFormEditProps {
  department: string | undefined;
}

const formSchema = object({
  department: string(),
});

type DepartmentFormEditData = TypeOf<typeof formSchema>;

export const DepartmentFormEdit: React.FC<DepartmentFormEditProps> = ({
  department,
}) => {
  const form = useForm<DepartmentFormEditData>({
    resolver: zodResolver(formSchema),
    defaultValues: { department: department ?? '' },
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
          type: 'department',
          value: formData.department,
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
        description: `An error occurred while update student's department`,
      });
    }
  });

  const toggleEdit = () => setActivelyEditing((editStatus) => !editStatus);
  return (
    <div className="border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Department
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
          className={cn('text-sm mt-2', !department && 'text-slate-500 italic')}
        >
          {department}
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      type="text"
                      placeholder="Edit your lastName"
                      {...field}
                      value={field.value || undefined}
                    />
                  </FormControl>
                  <FormMessage />
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
export { formSchema as departmentFormSchema };
export type { DepartmentFormEditData };
