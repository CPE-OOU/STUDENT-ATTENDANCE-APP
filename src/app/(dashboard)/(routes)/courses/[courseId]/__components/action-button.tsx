'use client';

import { generateInviteCode } from '@/actions/invite';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/use-modal';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hook';
import { toast } from 'sonner';

export const ActionButtons = ({
  user,
  courseId,
  lecturerAttendeeId,
  assignedStudentId,
}: {
  user: { lecturer: { id: string } };
  courseId: string;
  lecturerAttendeeId: string;
  assignedStudentId?: string;
}) => {
  const { onOpen } = useModal(({ onOpen }) => ({ onOpen }));
  const { execute, status } = useAction(generateInviteCode, {
    onSuccess: () => {
      toast.success('Invite Link', {
        description: 'Invite link has being generated',
      });
    },

    onError: () => {
      toast.success('Invite Link', {
        description: 'An error occurred while generating invite link',
      });
    },
  });
  return (
    <div>
      {user.lecturer ? (
        <div className="flex items-center gap-x-6">
          <Button
            onClick={() => {
              execute({ courseId });
            }}
            variant="outline"
            disabled={status === 'executing'}
          >
            Generate Invite Link
            <Loader2
              className={cn(
                'w-6 h-6 animate-spin hidden ml-4',
                status === 'executing' && 'block'
              )}
            />
          </Button>
          <Button
            disabled={status === 'executing'}
            onClick={() => {
              onOpen('create-attendance', {
                createAttendanceData: { courseId, lecturerAttendeeId },
              });
            }}
          >
            Create new attendance
          </Button>
        </div>
      ) : null}
    </div>
  );
};
