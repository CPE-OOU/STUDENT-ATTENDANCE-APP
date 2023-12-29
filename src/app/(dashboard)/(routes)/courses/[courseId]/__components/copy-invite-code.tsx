'use client';

import { Course } from '@/config/db/schema';
import { ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

export const CopyInviteCode = ({ course }: { course: Course }) => {
  return (
    <>
      {course.inviteCode && (
        <span
          onClick={async () => {
            await navigator.clipboard.writeText(
              `${location.origin}/invite/${course.inviteCode}`
            );

            toast.success('Invite Link', { description: 'Invite link copied' });
          }}
        >
          <ClipboardList className="w-8 h-8 ml-6 cursor-pointer" />
        </span>
      )}
    </>
  );
};
