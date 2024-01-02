'use client';

import { DataTable } from '@/components/ui/data-table';
import {
  StudentTakenAttendanceColumns,
  studentAttendanceColumns,
} from './columns';
import { ClientUser } from '@/lib/auth';
import { Course } from '@/config/db/schema';

interface StudentTakenAttendanceTableProps {
  data: Array<StudentTakenAttendanceColumns>;
  totalCount: number;
  user: ClientUser;
  course: Course;
}

export const StudentTakenAttendanceTable: React.FC<
  StudentTakenAttendanceTableProps
> = ({ data, totalCount, user, course }) => {
  return (
    <div className="flex h-full">
      <div className="flex-grow flex flex-col px-8 h-full">
        <div className="flex-grow">
          <DataTable
            data={data}
            columns={studentAttendanceColumns}
            totalCount={totalCount}
            meta={{ user, course }}
          />
        </div>
      </div>
    </div>
  );
};
