'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Course } from '@/config/db/schema';
import {
  Check,
  Eye,
  MoreHorizontal,
  Pencil,
  PersonStanding,
  X,
} from 'lucide-react';

import { format } from 'date-fns';
import { ClientUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export type StudentAttendancesColumns = {
  id: string;
  topicTitle: string;
  attendanceCapturerId: string | null;
  expiredAfter: '15min' | '30min' | '1hr' | null;
  expires: Date;
  lecturerAttendeeId: string;
  totalStudentPresent: number;
  totalStudentAbsent: number;
  lectureAttendee: {
    title: string;
    id: string;
    formOfAddress: string;
    firstName: string;
    lastName: string;
    email: string;
    userId: string;
    imageUrl: string | null;
    lecturerId: string;
  };

  studentCapturer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    userId: string;
    studentId: string;
  };
};

export const studentAttendanceColumns: ColumnDef<StudentAttendancesColumns>[] =
  [
    {
      accessorKey: 'topicTitle',
      header: 'Topic Title',
      enableHiding: false,
    },
    {
      accessorKey: 'expires',
      header: 'Expired Time',
      enableHiding: false,
      cell: ({ row }) => {
        let parseDate: string;
        try {
          parseDate = format(new Date(row.original.expires), 'd/MM/yyyy:HH:mm');
        } catch {
          parseDate = '-';
        }
        return <div>{parseDate}</div>;
      },
    },
    {
      accessorFn: ({ totalStudentAbsent, totalStudentPresent }) =>
        totalStudentPresent + totalStudentAbsent,
      header: 'Total Student',
      enableHiding: false,
    },
    {
      accessorKey: 'totalStudentPresent',
      header: 'Total Student Present',
      enableHiding: false,
    },
    {
      accessorKey: 'totalStudentAbsent',
      header: 'Total Student Absent',
      enableHiding: false,
    },

    {
      accessorFn: ({ studentCapturer }) =>
        studentCapturer
          ? `${studentCapturer.firstName} ${studentCapturer.lastName}`
          : '-',
      header: 'Taken By',
      enableHiding: true,
    },

    {
      accessorFn: ({ lectureAttendee }) =>
        `${lectureAttendee.formOfAddress?.toUpperCase()}. ${
          lectureAttendee.firstName
        } ${lectureAttendee.lastName}`,
      header: 'Created by',
      enableHiding: true,
    },
    {
      id: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row, table }) => {
        const meta = table.options.meta as { user: ClientUser; course: Course };
        const { id } = row.original;
        const router = useRouter();
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  router.push(
                    `/database/courses/${meta.course.id}?role=student`
                  );
                }}
                className="capitalize"
              >
                <PersonStanding className="w-4 h-4 mr-2 text-neutral-600" />
                attendees
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/attendances/${id}/courses/${meta.course.id}`);
                }}
                className="capitalize"
              >
                <Eye className="w-4 h-4 mr-2 text-neutral-600" />
                attendance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
