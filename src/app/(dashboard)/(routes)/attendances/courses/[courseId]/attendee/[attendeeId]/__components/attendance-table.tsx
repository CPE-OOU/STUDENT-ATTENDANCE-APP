'use client';

import { DataTable } from '@/components/ui/data-table';
import {
  StudentAttendanceApproveColumns,
  studentAttendanceApproveColumns,
} from './columns';
import { ClientUser } from '@/lib/auth';
import { Course } from '@/config/db/schema';

interface StudentAttendanceApproveTableProps {
  data: Array<StudentAttendanceApproveColumns>;
  totalCount: number;
  user: ClientUser;
  course: Course;
}

export const StudentAttenanceApproveTable: React.FC<
  StudentAttendanceApproveTableProps
> = ({ data, totalCount, user, course }) => {
  return (
    <div className="flex h-full">
      <div className="flex-grow flex flex-col px-8 h-full">
        <div className="flex-grow">
          <DataTable
            data={data}
            columns={studentAttendanceApproveColumns}
            totalCount={totalCount}
            meta={{ user, course }}
          />
        </div>
      </div>
    </div>
  );
};
