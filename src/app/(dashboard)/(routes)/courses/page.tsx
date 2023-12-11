import { DataTable } from '@/components/ui/data-table';
import { db } from '@/config/db/client';
import { getCurrentUser } from '@/lib/auth';
import { searchParamsSchema } from '@/lib/validations/params';
import { redirect } from 'next/navigation';
import { SideAction } from '../account/__components/side-action';
import {
  courses,
  lecturerAttendees,
  lecturers,
  users,
} from '@/config/db/schema';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import {
  LectureBuildCoursePayload,
  lectureBuildCourseObject,
  resolveLectureViewCourseSort,
} from '@/lib/db-statements/course';
import { courseColumns } from './__components/columns';

interface LecturerPartakeCoursesPageProps {
  searchParams: { [query: string]: unknown };
}

const LecturerPartakeCoursesPage = async ({
  searchParams,
}: LecturerPartakeCoursesPageProps) => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect('/sign-in?callbackUrl=/students');
  }

  if (user.type !== 'teacher') {
    return redirect('/');
  }

  const { per_page, offset, sort } = searchParamsSchema.parse(searchParams);

  const whereClause = sql`
  ${courses.id} in (
      SELECT ${lecturerAttendees.courseId} FROM ${lecturerAttendees}
      WHERE ${lecturerAttendees.lecturerId} = ${user.lecturer!.id}
    )
  `;

  let parsedSort = resolveLectureViewCourseSort(sort);

  const [data] = (await db.execute(sql`
    SELECT 
    (
      SELECT count(*) FROM  ${courses}
      WHERE ${whereClause}
    ) as "totalCourses",
    (
      SELECT CEIL(count(*) / ${per_page}) FROM  ${courses}
      WHERE ${whereClause}
    ) as totalCounts,
    (
     SELECT COALESCE(
        json_agg("buildCourse"), '[]'::json
      ) FROM 
        (
            SELECT ${lectureBuildCourseObject} as "buildCourse"
              FROM ${courses}
              INNER JOIN ${lecturers} ON ${sql`${courses.creatorId} = ${lecturers.id}`}
              INNER JOIN ${users} ON ${sql`${users.id} = ${lecturers.userId}`}
              WHERE ${whereClause}
              ORDER BY ${parsedSort}
              OFFSET ${offset}
              LIMIT ${per_page}
        ) as "courseList"
    ) as courses
    `)) as postgres.RowList<
    [
      {
        totalCourses: number;
        totalCounts: number;
        courses: Array<LectureBuildCoursePayload>;
      }
    ]
  >;

  return (
    <div className="flex h-full">
      <div className="flex-grow flex flex-col pt-[65px] px-8 h-full">
        <div className="flex justify-between mb-12">
          <h3 className="text-2xl leading-7">Student Records</h3>
        </div>

        <div className="flex-grow">
          <DataTable
            data={data.courses}
            columns={courseColumns}
            totalCount={data.totalCounts}
            meta={{ user }}
          />
        </div>
      </div>
      <div className="flex-shrink-0 w-[480px] ">
        <SideAction user={user} />
      </div>
    </div>
  );
};

export default LecturerPartakeCoursesPage;
