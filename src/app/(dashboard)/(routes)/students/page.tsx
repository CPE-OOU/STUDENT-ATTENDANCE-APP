import { DataTable } from '@/components/ui/data-table';
import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  studentAttendees,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { searchParamsSchema } from '@/lib/validations/params';
import { redirect } from 'next/navigation';
import { object, string } from 'zod';
import { studentColumns } from './__components/column';
import { SideAction } from '../account/__components/side-action';
import {
  CurrentLecturerCoursesQueryPlaceholders,
  currentLecturerCoursesQuery,
} from './__query/prepare';
import { StudentCourseSelect } from './__components/student-course-select';
import postgres from 'postgres';
import {
  StudentAttendeeBuildObject,
  studentAttendeeBuildObject,
} from '@/lib/db-statements/student-attendee';
import { sql } from 'drizzle-orm';
import { resolveLectureViewCourseField } from '@/lib/db-statements/course';

interface LectureStudentAttendeePageProps {
  searchParams: { [query: string]: unknown };
}

const lectureAttendSearchParamsSchema = searchParamsSchema.and(
  object({
    courseId: string().uuid().optional(),
  })
);
const LectureStudentAttendeePage = async ({
  searchParams,
}: LectureStudentAttendeePageProps) => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect('/sign-in?callbackUrl=/students');
  }

  if (user.type !== 'teacher') {
    return redirect('/');
  }

  const { per_page, offset, courseId, sort } =
    lectureAttendSearchParamsSchema.parse(searchParams);

  let currentAttendanceCourse;

  const lecturerCourses = await currentLecturerCoursesQuery.execute({
    lecturerId: user.lecturer!.id,
    limit: null,
  } satisfies CurrentLecturerCoursesQueryPlaceholders);

  if (courseId) {
    [currentAttendanceCourse] = await db.select().from(courses).where(sql`
      ${courseId} = ${courses.id} AND ${user.lecturer!.id} in 
      (
        SELECT * FROM ${lecturerAttendees}
        WHERE ${lecturerAttendees.courseId} = ${courseId}
        )
      `);
  } else {
    [currentAttendanceCourse] = await currentLecturerCoursesQuery.execute({
      lecturerId: user.lecturer!.id,
      limit: 1,
    } satisfies CurrentLecturerCoursesQueryPlaceholders);
  }

  const sortField = resolveLectureViewCourseField(sort);

  let attendeesInfo;
  if (currentAttendanceCourse) {
    const whereClauseCond = sql`
      ${studentAttendees.courseId} =  ${currentAttendanceCourse.id}
    `;

    [attendeesInfo] = (await db.execute(sql`
    SELECT 
    (
      SELECT count(*) FROM  ${studentAttendees}
      WHERE ${whereClauseCond}
    ) as "totalCourses",
    (
      SELECT CEIL(count(*) / ${per_page}) FROM  ${studentAttendees}
      WHERE ${whereClauseCond}
    ) as totalCounts,
    (
      SELECT COALESCE(json_agg(attendee), '[]'::json) FROM (
          SELECT ${studentAttendeeBuildObject} as attendee FROM ${studentAttendees} 
          WHERE ${whereClauseCond}
          ORDER BY ${sortField}
          OFFSET ${offset}
          LIMIT ${per_page}
        ) as "studentAttendeesList"
    ) as studentAttendees
    `)) as postgres.RowList<
      [
        {
          totalCourses: number;
          totalCounts: number;
          studentAttendees: Array<StudentAttendeeBuildObject>;
        }
      ]
    >;
  }

  const missingCourse = courseId && !!currentAttendanceCourse;
  return (
    <div className="h-full">
      <div className="flex-grow flex flex-col pt-[65px] px-8 h-full">
        <div className="flex justify-between mb-12">
          <h3 className="text-2xl leading-7">Student Records</h3>
          <StudentCourseSelect courses={lecturerCourses} />
        </div>

        <div className="flex-grow">
          <DataTable
            data={attendeesInfo?.studentAttendees ?? []}
            totalCount={attendeesInfo?.totalCounts ?? 0}
            columns={studentColumns}
          />
        </div>
      </div>
    </div>
  );
};

export default LectureStudentAttendeePage;
