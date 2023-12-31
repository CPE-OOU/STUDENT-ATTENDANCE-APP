import { db } from '@/config/db/client';
import {
  attendances,
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendees,
  students,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { desc, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AttendeeRecordPage() {
  const user = await getCurrentUser();
  const url = headers().get('referer');

  console.log({ url });
  if (!user) {
    return redirect(`/sign-in?callbackUrl=${url}`);
  }

  const [lastTakenAttendance] = await db
    .select()
    .from(attendances)
    .where(
      sql`
${attendances.courseId} IN  
      (SELECT "courseId" FROM (
         (
            SELECT ${studentAttendees.courseId} as "courseId" from ${studentAttendees}
            INNER JOIN ${students} ON ${students.id} = ${studentAttendees.studentId}
            WHERE ${students.userId} = ${user.id}
          )
      UNION 
          (
            SELECT ${lecturerAttendees.courseId} as "courseId" from ${lecturerAttendees}
            INNER JOIN ${lecturers} ON ${lecturers.id} = ${lecturerAttendees.lecturerId}
            WHERE ${lecturers.userId} = ${user.id}
          )
      ) as "userCourse"
)
`
    )
    .orderBy(desc(attendances.createdAt))
    .limit(1);

  let course;
  if (!lastTakenAttendance) {
    [course] = await db
      .select()
      .from(courses)
      .where(
        sql`
      ${courses.id} IN  
            (SELECT "courseId" FROM (
               (
                  SELECT ${studentAttendees.courseId} as "courseId" from ${studentAttendees}
                  INNER JOIN ${students} ON ${students.id} = ${studentAttendees.studentId}
                  WHERE ${students.userId} = ${user.id}
                )
            UNION 
                (
                  SELECT ${lecturerAttendees.courseId} as "courseId" from ${lecturerAttendees}
                  INNER JOIN ${lecturers} ON ${lecturers.id} = ${lecturerAttendees.lecturerId}
                  WHERE ${lecturers.userId} = ${user.id}
                )
            ) as "userCourse"
      )
      `
      )
      .orderBy(desc(courses.createdAt))
      .limit(1);
  }

  let courseId = lastTakenAttendance?.courseId ?? course?.id;

  if (courseId) {
    return redirect(`/database/courses/${courseId}`);
  }

  return <div>No course available create a new course</div>;
}
