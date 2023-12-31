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
import { SelectResultField, getUrlQuery, jsonBuildObject } from '@/lib/utils';
import { searchParamsSchema } from '@/lib/validations/params';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { TypeOf, object, string } from 'zod';
import { StudentAttendancesTable } from './__components/attendances-table';

const currentPageSearchParams = searchParamsSchema;

const paramsSchema = object({ courseId: string().uuid() });

const CourseAttendancePage = async ({
  searchParams,
  params,
}: {
  params: TypeOf<typeof paramsSchema>;
  searchParams: TypeOf<typeof currentPageSearchParams>;
}) => {
  params = paramsSchema.parse(params);
  searchParams = currentPageSearchParams.parse(searchParams);
  const { offset, per_page } = searchParams;
  const { courseId } = params;
  const user = await getCurrentUser();
  const url = headers().get('referer')!;

  if (!user) {
    return redirect(`/sign-in?callbackUrl=${url}`);
  }

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId));

  if (!course) return notFound();

  const courseAttendances = alias(attendances, 'course_attendance');

  const {
    topicTitle,
    attendanceCapturerId,
    expiredAfter,
    expires,
    lecturerAttendeeId,
    id,
  } = getTableColumns(courseAttendances);
  const {
    firstName,
    lastName,
    email,
    imageUrl,
    id: userId,
  } = getTableColumns(users);
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
    email,
    imageUrl,
    userId,
    studentId: students.id,
  });

  const [attendanceListing, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id,
        topicTitle,
        attendanceCapturerId,
        expiredAfter,
        expires,
        lecturerAttendeeId,
        totalStudentPresent: sql<number>`(SELECT count(*)::INTEGER FROM ${studentAttendances}
                                  WHERE ${studentAttendances.attendanceId} = ${courseAttendances.id} 
                                  AND ${studentAttendances.present} = TRUE)`,
        totalStudentAbsent: sql<number>`(SELECT count(*)::INTEGER FROM ${studentAttendances}
                                WHERE ${studentAttendances.attendanceId} = ${courseAttendances.id} 
                                AND ${studentAttendances.present} = FALSE)`,
        lectureAttendee: sql<
          SelectResultField<typeof lectureAssigneeSelect>
        >`(SELECT ${lectureAssigneeSelect} FROM ${lecturerAttendees}
        INNER JOIN ${lecturers} ON ${lecturers.id} = ${lecturerAttendees.lecturerId}
        INNER JOIN ${users} ON ${users.id} = ${lecturers.userId}
        WHERE ${lecturerAttendees.id} = ${lecturerAttendeeId}
        )
        `,

        studentCapturer: sql<SelectResultField<typeof studentCapturerSelect>>`
        (SELECT ${studentCapturerSelect} FROM ${studentAttendees}
        INNER JOIN ${students} ON ${students.id} = ${studentAttendees.studentId}
        INNER JOIN ${users} ON ${users.id} = ${students.userId}
        WHERE ${studentAttendees.id} = ${courseAttendances.attendanceCapturerId}
      )
      `,
      })
      .from(courseAttendances)
      .leftJoin(courses, eq(courses.id, courseAttendances.courseId))
      .offset(offset)
      .limit(per_page)
      .where(eq(courseAttendances.courseId, course.id)),

    db
      .select({
        totalCount: sql<number>`CEIL(count(*)::FLOAT/${per_page})::INTEGER`,
      })
      .from(courseAttendances)
      .where(eq(courseAttendances.courseId, course.id)),
  ]);

  return (
    <div>
      <StudentAttendancesTable
        data={attendanceListing as any}
        totalCount={totalCount}
        user={user}
        course={course}
      />
    </div>
  );
};

export default CourseAttendancePage;
