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
            {/* <DropDownMenu */}
            <DropdownMenuItem>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                className="flex justify-center items-center"
                href={`/courses/${id}`}
              >
                <Eye className="w-4 h-4 mr-2" /> View
              </Link>
            </DropdownMenuItem>

            <Separator />

            <DropdownMenuItem
              className="text-rose-600"
              onClick={() =>
                execute({ courseId: id, lecturerId: meta.user.lecturer!.id })
              }
            >
              {deleteCourseStatus === 'executing' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash className="w-4 h-4 mr-2" />
              )}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
