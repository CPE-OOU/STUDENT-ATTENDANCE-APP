'use client';

import { ColumnDef } from '@tanstack/react-table';

export type StudentColumns = {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  level: '100' | '200' | '300' | '400' | '500' | '700';
  university: string;
};

export const studentColumns: ColumnDef<StudentColumns>[] = [
  {
    accessorFn: ({ firstName, lastName }) => `${firstName} ${lastName}`,
    header: 'Name',
    enableHiding: false,
  },
  { accessorKey: 'level', header: 'Level', enableHiding: false },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'department', header: 'Department', enableHiding: false },
  { accessorKey: 'university', header: 'University', enableHiding: false },
];
