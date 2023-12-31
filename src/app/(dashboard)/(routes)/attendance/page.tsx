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
import { getUrlQuery, jsonBuildObject } from '@/lib/utils';
import { searchParamsSchema } from '@/lib/validations/params';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { TypeOf, object, string } from 'zod';

const currentPageSearchParams = searchParamsSchema.and(
  object({
    courseId: string().uuid(),
  })
);

const CourseAttendancePage = async ({
  searchParams,
}: {
  searchParams: TypeOf<typeof currentPageSearchParams>;
}) => {
  searchParams = currentPageSearchParams.parse(searchParams);
  const { offset, courseId, per_page } = searchParams;
  const user = await getCurrentUser();
  const url = headers().get('referer')!;

  if (!user) {
    return redirect(`/sign-in?callbackUrl=${url}`);
  }

  const whereClause = user.student
    ? sql`
                   (
                     SELECT ${studentAttendees.courseId} FROM ${studentAttendees}
                     INNER JOIN ${students} ON ${students.id} = ${studentAttendees.studentId}
                     WHERE ${students.userId} = ${user.id}
                   ) `
    : sql`
                   (
                     SELECT ${lecturerAttendees.courseId} FROM ${lecturerAttendees}
                     INNER JOIN ${lecturers} ON ${lecturers.id} = ${lecturerAttendees.lecturerId}
                     WHERE ${lecturers.userId} = ${user.id}
                   ) 
                   `;

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
  const [attendanceListing, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id,
        topicTitle,
        attendanceCapturerId,
        expiredAfter,
        expires,
        lecturerAttendeeId,
        totalStudentPresent: sql<number>`(SELECT count(*):INTEGER FROM ${studentAttendances}
                                  WHERE ${studentAttendances.attendanceId} = ${courseAttendances.id} 
                                  AND ${studentAttendances.present} = TRUE)`,
        totalStudentAbsent: sql<number>`(SELECT count(*):INTEGER FROM ${studentAttendances}
                                WHERE ${studentAttendances.attendanceId} = ${courseAttendances.id} 
                                AND ${studentAttendances.present} = FALSE)`,
        lectureAttendee: sql`(SELECT ${jsonBuildObject({
          id: lecturerAttendees.id,
          firstName,
          lastName,
          email,
          imageUrl,
          userId,
          lecturerId: lecturers.id,
        })} FROM ${lecturerAttendees}
                                      WHERE ${
                                        lecturerAttendees.id
                                      } = ${lecturerAttendeeId}
                                      INNER JOIN ${lecturers} ON ${
          lecturers.id
        } = ${lecturerAttendees.lecturerId}
                                      INNER JOIN ${users} ON ${users.id} = ${
          lecturers.userId
        })`,

        studentCapturer: sql`
        CASE ${attendanceCapturerId} IS NOT NULL THEN (
              SELECT ${jsonBuildObject({
                id: studentAttendees.id,
                firstName,
                lastName,
                email,
                imageUrl,
                userId,
                studentId: students.id,
              })} FROM ${studentAttendees}
                                            WHERE ${
                                              studentAttendees.id
                                            } = ${attendanceCapturerId}
                                            INNER JOIN ${students} ON ${
          students.id
        } = ${studentAttendees.studentId}
                                            INNER JOIN ${users} ON ${
          users.id
        } = ${students.userId}
            )
        ELSE NULL
          `,
      })
      .from(courseAttendances)
      .offset(offset)
      .limit(per_page)
      .where(whereClause),

    db
      .select({
        totalCount: sql<number>`CEIL(count(*)::FLOAT/${per_page})::INTEGER`,
      })
      .from(courseAttendances)
      .where(whereClause),
  ]);
  return <div></div>;
};

export default CourseAttendancePage;
