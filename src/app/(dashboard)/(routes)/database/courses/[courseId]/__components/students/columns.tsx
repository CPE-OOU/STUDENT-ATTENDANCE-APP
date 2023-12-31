'use client';
import { capitialize } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LectureBuildCoursePayload } from '@/lib/db-statements/course';
import { ColumnDef } from '@tanstack/react-table';
import { Course } from '@/config/db/schema';
import {
  Eye,
  File,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useAction } from 'next-safe-action/hook';
import { deleteCourse } from '@/actions/courses';
import { ClientUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { removeStudentAttendee } from '@/actions/student-attendee';

export type StudentAttendeeColumns = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userId: string;
  studentId: string;
  department: string;
  level: string;
};

export const studentAttendeeColumns: ColumnDef<StudentAttendeeColumns>[] = [
  {
    accessorKey: 'fullName',
    header: 'FullName',
    enableHiding: false,
  },
  { accessorKey: 'email', header: 'Email', enableHiding: false },
  { accessorKey: 'department', header: 'Department', enableHiding: false },
  { accessorKey: 'level', header: 'Level', enableHiding: false },
  {
    id: 'Actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => {
      const { execute: removeStudent, status: removeStudentstatus } = useAction(
        removeStudentAttendee,
        {
          onSuccess: () => {},
          onError: () => {},
        }
      );
      const meta = table.options.meta as { user: ClientUser; course: Course };
      const { id: studentAttendeeId } = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link
                className="flex justify-center items-center"
                href={`/attendance/courses/${meta.course.id}`}
              >
                <Eye className="w-4 h-4 mr-2" /> View Attendance
              </Link>
            </DropdownMenuItem>

            <Separator />

            <DropdownMenuItem
              className="text-rose-600"
              onClick={() => {
                removeStudent({
                  courseId: meta.course.id,
                  studentAttendeeId,
                  actionUserId: meta.user.id,
                });
              }}
            >
              {removeStudentstatus === 'executing' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash className="w-4 h-4 mr-2" />
              )}
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
