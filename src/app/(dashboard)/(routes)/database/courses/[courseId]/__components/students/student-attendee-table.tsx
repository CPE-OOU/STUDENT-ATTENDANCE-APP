'use client';

import { DataTable } from '@/components/ui/data-table';
import { StudentAttendeeColumns, studentAttendeeColumns } from './columns';
import { ClientUser } from '@/lib/auth';
import { SideAction } from '@/app/(dashboard)/(routes)/account/__components/side-action';
import { Course } from '@/config/db/schema';

interface StudentAttendeeTableProps {
  data: Array<StudentAttendeeColumns>;
  totalCount: number;
  user: ClientUser;
  course: Course;
}

export const StudentAttendeeTable: React.FC<StudentAttendeeTableProps> = ({
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
            Student Records for {course.name}
          </h3>
        </div>

        <div className="flex-grow">
          <DataTable
            data={data}
            columns={studentAttendeeColumns}
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
