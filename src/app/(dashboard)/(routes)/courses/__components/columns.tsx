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
import { PersonIcon } from '@radix-ui/react-icons';

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
  {
    id: 'Actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => {
      const { execute, status: deleteCourseStatus } = useAction(deleteCourse);
      const meta = table.options.meta as { user: ClientUser };
      const { id } = row.original;

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
                href={`/courses/${id}`}
              >
                <Eye className="w-4 h-4 mr-2" /> Course details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                className="flex justify-center items-center"
                href={`/attendances/courses/${id}`}
              >
                <PersonIcon className="w-4 h-4 mr-2" /> Attendance
              </Link>
            </DropdownMenuItem>

            <Separator />

            <DropdownMenuItem
              className="text-rose-600"
              onClick={() => execute({ courseId: id, userId: meta.user.id })}
            >
              {deleteCourseStatus === 'executing' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash className="w-4 h-4 mr-2" />
              )}
              {meta.user.lecturer ? 'delete' : 'leave'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
