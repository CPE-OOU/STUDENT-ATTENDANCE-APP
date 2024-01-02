import { db } from '@/config/db/client';
import {
  attendances,
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendances,
  studentAttendees,
  students,
  users,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { SelectResultField, jsonBuildObject } from '@/lib/utils';
import { searchParamsSchema } from '@/lib/validations/params';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { TypeOf, object, string } from 'zod';
import { StudentAttenanceApproveTable } from './__components/attendance-table';

const currentPageSearchParams = searchParamsSchema;
const paramsSchema = object({
  courseId: string().uuid(),
  attendeeId: string().uuid(),
});

const StudendAttendancePage = async ({
  searchParams,
  params,
}: {
  params: TypeOf<typeof paramsSchema>;
  searchParams: TypeOf<typeof currentPageSearchParams>;
}) => {
  params = paramsSchema.parse(params);
  searchParams = currentPageSearchParams.parse(searchParams);
  const { offset, per_page } = searchParams;
  const { courseId, attendeeId } = paramsSchema.parse(params);
  const user = await getCurrentUser();
  const url = headers().get('referer')!;

  if (!user) {
    return redirect(`/sign-in?callbackUrl=${url}`);
  }

  const {
    firstName,
    lastName,
    email,
    imageUrl,
    id: userId,
  } = getTableColumns(users);
  const { id: studentAttendeeId } = getTableColumns(studentAttendees);
  const [[course], [courseAttendee]] = await Promise.all([
    db.select().from(courses).where(eq(courses.id, courseId)),
    db
      .select({
        id: studentAttendeeId,
        studentAttendeeId,
        firstName,
        lastName,
        fullName: sql<string>`concat(${firstName}, ' ', ${lastName})`,
        email,
        imageUrl,
        userId,
      })
      .from(studentAttendees)
      .innerJoin(students, eq(students.id, studentAttendees.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .where(
        sql`${studentAttendees.courseId} = ${courseId} AND ${studentAttendees.id} = ${attendeeId}`
      ),
  ]);
  if (!(course && courseAttendee)) return notFound();

  const { topicTitle, lecturerAttendeeId } = getTableColumns(attendances);

  const {
    present,
    joinTime,
    id: attendanceId,
  } = getTableColumns(studentAttendances);

  const { title, formOfAddress } = getTableColumns(lecturers);

  const lectureAssigneeSelect = jsonBuildObject({
    id: lecturerAttendees.id,
    title,
    formOfAddress,
    firstName,
    lastName,
    email,
    imageUrl,
    userId,
    lecturerId: lecturers.id,
  });

  const studentCapturerSelect = jsonBuildObject({
    id: studentAttendees.id,
    firstName,
    lastName,
    fullName: sql<string>`concat(${firstName}, ' ', ${lastName})`,
    email,
    imageUrl,
    userId,
    studentId: students.id,
  });

  const [takenAttendanceListing, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: attendanceId,
        topicTitle,
        present,
        joinTime,
        lecturerAttendeeId,
        lectureAttendee: sql<SelectResultField<typeof lectureAssigneeSelect>>`(
          SELECT ${lectureAssigneeSelect} FROM ${lecturerAttendees}
          INNER JOIN ${lecturers} ON ${lecturers.id} = ${lecturerAttendees.lecturerId}
          INNER JOIN ${users} ON ${users.id} = ${lecturers.userId}
          WHERE ${lecturerAttendees.id} = ${lecturerAttendeeId}
          )`,

        attendanceTakenBy: sql<SelectResultField<typeof studentCapturerSelect>>`
        (SELECT ${studentCapturerSelect} FROM ${studentAttendees}
        INNER JOIN ${students} ON ${students.id} = ${studentAttendees.studentId}
        INNER JOIN ${users} ON ${users.id} = ${students.userId}
        WHERE ${studentAttendees.id} = ${attendances.attendanceCapturerId}
      )
        `,
      })
      .from(studentAttendances)
      .innerJoin(
        attendances,
        eq(attendances.id, studentAttendances.attendanceId)
      )
      .offset(offset)
      .limit(per_page)
      .where(sql`${studentAttendances.studentAttendeeId} = ${attendeeId}
      AND ${attendances.courseId} = ${courseId}`),

    db
      .select({
        totalCount: sql<number>`CEIL(count(*)::FLOAT/${per_page})::INTEGER`,
      })
      .from(studentAttendances)
      .innerJoin(
        attendances,
        eq(attendances.id, studentAttendances.attendanceId)
      )
      .where(
        sql`${studentAttendances.studentAttendeeId} = ${attendeeId} 
        AND ${attendances.courseId} = ${courseId}`
      ),
  ]);

  return (
    <div className="pt-14">
      <div className="px-8">
        <div className="space-y-4">
          <h4 className="text-2xl font-semibold leaing-[120%] uppercase">
            Course Attendance
          </h4>

          <div className="space-y-4">
            <p className="text-xm text-neutral-600 font-semibold uppercase">
              {course.name}
            </p>
            <div className="flex items-center gap-x-4">
              <span className="text-muted-foreground text-lg">
                Attendee Name:
              </span>
              <p className="text-neutral-800 text-2xl capitalize">
                {courseAttendee.fullName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <StudentAttenanceApproveTable
        totalCount={totalCount}
        course={course}
        data={takenAttendanceListing as any}
        user={user}
      />
    </div>
  );
};

export default StudendAttendancePage;
