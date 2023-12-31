import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendees,
  students,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const CourseAttendancePage = async () => {
  const user = await getCurrentUser();
  const url = headers().get('referer')!;

  if (!user) {
    return redirect(`/sign-in?callbackUrl=${url}`);
  }

  const [lastCourse] = await db.select().from(courses).where(sql`
          ${courses.id} = (
            (
              SELECT ${studentAttendees.courseId} as "courseId" from ${studentAttendees}
              INNER JOIN ${students} ON ${students.id} = ${studentAttendees.studentId}
              WHERE ${students.userId} = ${user.id}
              LIMIT 1
            )
        UNION 
            (
              SELECT ${lecturerAttendees.courseId} as "courseId" from ${lecturerAttendees}
              INNER JOIN ${lecturers} ON ${lecturers.id} = ${lecturerAttendees.lecturerId}
              WHERE ${lecturers.userId} = ${user.id}
              LIMIT 1
            )
          )
      `);

  if (lastCourse) {
    return redirect(`/attendances/courses/${lastCourse.id}`);
  }

  return <div></div>;
};

export default CourseAttendancePage;
