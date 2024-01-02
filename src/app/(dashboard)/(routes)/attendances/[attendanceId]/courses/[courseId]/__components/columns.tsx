'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

export type StudentTakenAttendanceColumns = {
  id: string;
  fullName: string;
  present: boolean | null;
  joinTime: Date | null;
  level: '100' | '200' | '300' | '400' | '500' | '700';
  department: string;
  university: string;
  studentAttendanceId: string;
  attendanceId: string;
  lecturerAttendeeId: string;
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

  attendanceTakenBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    userId: string;
    studentId: string;
  };
};

export const studentAttendanceColumns: ColumnDef<StudentTakenAttendanceColumns>[] =
  [
    {
      accessorKey: 'fullName',
      header: 'FullName',
      enableHiding: false,
    },
    {
      accessorKey: 'present',
      header: 'Present',
      enableHiding: false,
      cell: ({ getValue }) =>
        getValue() ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <X className="w-5 h-5 text-rose-600" />
        ),
    },
    {
      accessorKey: 'joinTime',
      header: 'Capture Time',
      enableHiding: false,
      cell: ({ getValue }) => (
        <div>{format(new Date(getValue() as string), 'd/MM/yyyy:HH:mm')}</div>
      ),
    },
    {
      accessorFn: ({ attendanceTakenBy }) =>
        attendanceTakenBy
          ? `${attendanceTakenBy.firstName} ${attendanceTakenBy.lastName}`
          : '-',
      header: 'Taken By',
      enableHiding: false,
    },

    {
      accessorFn: ({ lectureAttendee }) =>
        `${lectureAttendee.formOfAddress?.toUpperCase()}. ${
          lectureAttendee.firstName
        } ${lectureAttendee.lastName}`,
      header: 'Created by',
      enableHiding: false,
    },
  ];
