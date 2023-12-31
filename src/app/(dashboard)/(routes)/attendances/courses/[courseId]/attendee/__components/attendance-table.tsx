'use client';

import { DataTable } from '@/components/ui/data-table';
import { StudentAttendanceColumns, studentAttendanceColumns } from './columns';
import { ClientUser } from '@/lib/auth';
import { SideAction } from '@/app/(dashboard)/(routes)/account/__components/side-action';
import { Course } from '@/config/db/schema';

interface StudentAttendanceTableProps {
  data: Array<StudentAttendanceColumns>;
  totalCount: number;
  user: ClientUser;
  course: Course;
}

export const StudentAttendanceTable: React.FC<StudentAttendanceTableProps> = ({
  data,
  totalCount,
  user,
  course,
}) => {
  return (
    <div className="flex h-full">
      <div className="flex-grow flex flex-col pt-[65px] px-8 h-full">
        <div className="flex justify-between mb-12">
          <h3 className="text-2xl leading-7 font-semibold capitalize">
            Student Attendance for {course.name}
          </h3>
        </div>

        <div className="flex-grow">
          <DataTable
            data={data}
            columns={studentAttendanceColumns}
            totalCount={totalCount}
            meta={{ user, course }}
          />
        </div>
      </div>
      <div className="flex-shrink-0 w-[480px] ">
        <SideAction user={user} />
      </div>
    </div>
  );
};
