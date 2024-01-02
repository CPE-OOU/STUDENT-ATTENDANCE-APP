'use client';

import { DataTable } from '@/components/ui/data-table';
import {
  LecturerViewAttendanceColumns,
  StudentViewAttendanceTableColumns,
  lecturerViewAttendanceColumns,
  studentViewAttendanceApproveColumns,
} from './columns';
import { ClientUser } from '@/lib/auth';
import { SideAction } from '@/app/(dashboard)/(routes)/account/__components/side-action';
import { Course } from '@/config/db/schema';

interface LecturerAttendanceViewTableProps {
  data: Array<LecturerViewAttendanceColumns>;
  totalCount: number;
  user: ClientUser;
  course: Course;
}

export const LecturerAttendanceViewTable: React.FC<
  LecturerAttendanceViewTableProps
> = ({ data, totalCount, user, course }) => {
  return (
    <div className="flex h-full">
      <div className="flex-grow flex flex-col pt-[65px] px-8 h-full">
        <div className="flex-grow">
          <DataTable
            data={data}
            columns={lecturerViewAttendanceColumns}
            totalCount={totalCount}
            meta={{ user, course }}
          />
        </div>
      </div>
    </div>
  );
};

type StudentAttedanceViewTableProps = {
  data: Array<StudentViewAttendanceTableColumns>;
  totalCount: number;
  user: ClientUser;
  course: Course;
};

export const StudentAttendanceViewTable: React.FC<
  StudentAttedanceViewTableProps
> = ({ data, totalCount, user, course }) => {
  return (
    <div className="flex h-full">
      <div className="flex-grow flex flex-col pt-[65px] px-8 h-full">
        <div className="flex-grow">
          <DataTable
            data={data}
            columns={studentViewAttendanceApproveColumns}
            totalCount={totalCount}
            meta={{ user, course }}
          />
        </div>
      </div>
    </div>
  );
};
