'use client';

import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/use-modal';

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
}

export const AttendanceItem = ({ attendance }: AttendanceItemProps) => {
  const { onOpen } = useModal(({ onOpen }) => ({ onOpen }));
  return (
    <div className="inline-flex items-center gap-x-8">
      <div>
        <h4 className="uppercase text-lg">{attendance.topicTitle}</h4>
      </div>
      <Button
        onClick={() =>
          onOpen('take-attendance', {
            takeAttendanceData: {
              id: attendance.id,
            },
          })
        }
      >
        Start Attendance
      </Button>
    </div>
  );
};
