'use client';

import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/use-modal';
import { format } from 'date-fns';

interface AttendanceItemProps {
  attendance: {
    createdBy: string;
    id: string;
    topicTitle: string;
    courseId: string;
    lecturerAttendeeId: string;
    attendanceCapturerId: string | null;
    expiredAfter: '15min' | '30min' | '1hr' | null;
    expires: Date;
    createdAt: Date | null;
  };
  attendanceCapturerId?: string | undefined;
}

export const AttendanceItem = ({
  attendance,
  attendanceCapturerId,
}: AttendanceItemProps) => {
  const { onOpen } = useModal(({ onOpen }) => ({ onOpen }));
  return (
    <div className="inline-flex items-center gap-x-8 border px-8 py-6">
      <div>
        <h4 className="uppercase text-lg font-semibold">
          {attendance.topicTitle}
        </h4>
        <p className="text-sm text-neutral-60">
          Expired at {format(new Date(attendance.expires), 'm')}mins
        </p>
      </div>
      {
        <Button
          onClick={() => {
            onOpen('take-attendance', {
              takeAttendanceData: {
                id: attendance.id,
                courseId: attendance.courseId,
                attendanceCapturerId: 'b6416c2d-fbef-4434-b954-29138bed7f74',
              },
            });
          }}
        >
          Start Attendance
        </Button>
      }
    </div>
  );
};
