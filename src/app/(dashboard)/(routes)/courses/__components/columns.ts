'use client';
import { capitialize } from '@/lib/utils';

import { LectureBuildCoursePayload } from '@/lib/db-statements/course';
import { ColumnDef } from '@tanstack/react-table';

export type courseColumns = LectureBuildCoursePayload;
export const courseColumns: ColumnDef<courseColumns>[] = [
  {
    accessorKey: 'courseName',
    header: 'Course name',
    enableHiding: false,
  },
  { accessorKey: 'courseCode', header: 'Course Code', enableHiding: false },
  {
    accessorFn: ({ lectureFormOfAddress, lecturerName }) =>
      `${capitialize(lectureFormOfAddress)}. ${lecturerName}`,
    header: 'CourseCreateBy',
  },
];
