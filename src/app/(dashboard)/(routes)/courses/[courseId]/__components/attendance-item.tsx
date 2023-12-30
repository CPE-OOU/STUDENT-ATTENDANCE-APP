'use client';

import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/use-modal';
import { differenceInMinutes, format } from 'date-fns';
import { SelectCapturer } from './choose-capturer';

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
  courseAttendees: {
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

  lectureAttendeeId?: string;
  currentCapturerId?: string;
}

export const AttendanceItem = ({
  attendance,
  courseAttendees,
  lectureAttendeeId,
  currentCapturerId,
}: AttendanceItemProps) => {
  const { onOpen } = useModal(({ onOpen }) => ({ onOpen }));
  const dateDiffInMins = differenceInMinutes(
    new Date(attendance.expires),
    Date.now()
  );
  if (dateDiffInMins < 1) return null;
  return (
    <div className="flex items-start justify-between border px-8 py-6">
      <div>
        <h4 className="uppercase text-lg font-semibold">
          {attendance.topicTitle}
        </h4>
        <p className="text-sm text-neutral-60">
          Expires in {dateDiffInMins} mins
        </p>
      </div>
      <div>
        {lectureAttendeeId ? (
          <SelectCapturer
            data={courseAttendees}
            {...(currentCapturerId && { currentCapturerId })}
            attendanceId={attendance.id}
            courseId={attendance.courseId}
          />
        ) : currentCapturerId ? (
          <Button
            onClick={() => {
              onOpen('take-attendance', {
                takeAttendanceData: {
                  id: attendance.id,
                  courseId: attendance.courseId,
                  attendanceCapturerId: currentCapturerId,
                },
              });
            }}
          >
            Start Attendance
          </Button>
        ) : null}
      </div>
    </div>
  );
};
