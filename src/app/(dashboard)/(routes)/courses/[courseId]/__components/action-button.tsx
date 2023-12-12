'use client';

import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/use-modal';

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
  return (
    <div>
      {
        user.lecturer ? (
          <Button
            onClick={() => {
              onOpen('create-attendance', {
                createAttendanceData: { courseId, lecturerAttendeeId },
              });
            }}
          >
            Create new attendance
          </Button>
        ) : null
        //    assignedStudentId && assignedStudentId === user.student?.id ? (
        //     <Button onClick={() => onOpen('take-attendance')}>
        //       Take Attendance
        //     </Button>
        //   ) : null
      }
    </div>
  );
};
