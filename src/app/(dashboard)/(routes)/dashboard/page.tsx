import { db } from '@/config/db/client';
import {
  attendances,
  courses,
  lecturerAttendees,
  studentAttendances,
  studentAttendees,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const DashboardPage = async () => {
  const user = await getCurrentUser();
  if (!user) return redirect('/sign-in?callbackUrl=/dashboard');

  if (user.type === 'teacher') {
    const [data] = (await db.execute(sql`
      SELECT 
      (
        SELECT count(*) FROM 
        (
          SELECT distinct ${studentAttendees.studentId} FROM ${studentAttendees}
          WHERE ${studentAttendees.courseId} IN  
              (
                SELECT ${courses.id} FROM ${courses}
                INNER JOIN ${lecturerAttendees} ON 
                ${lecturerAttendees.courseId} = ${courses.id}
                WHERE ${lecturerAttendees.lecturerId} = ${user.lecturer!.id}
              )
        ) as "uniqueStudentLists"
      ) as "totalStudent", 
      (
        SELECT count(*) FROM ${courses}
        WHERE ${courses.id} in 
          (
            SELECT ${courses.id} FROM ${courses}
            INNER JOIN ${lecturerAttendees} 
            ON ${lecturerAttendees.courseId} = ${courses.id}
            WHERE ${lecturerAttendees.lecturerId} = ${user.lecturer!.id}
          )
      ) as "totalCourse",
        (
          SELECT count(*) FROM ${attendances}
          WHERE ${attendances.lecturerAttendeeId} in 
            (
              SELECT ${lecturerAttendees.id} FROM ${lecturerAttendees}
              WHERE ${lecturerAttendees.lecturerId} = ${user.lecturer!.id}
            )
        ) as "totalAttendanceTaken"
    `)) as postgres.RowList<
      [
        {
          totalStudent: number;
          totalalCourse: number;
          totalAttendanceTaken: number;
        }
      ]
    >;

    return <div>Lecturer Dashboard</div>;
  } else {
    const [data] = await db.execute(sql`
    SELECT
      (
        SELECT count(*) FROM ${courses}
        WHERE ${courses.id} in
          (
            SELECT ${courses.id} FROM ${courses}
            INNER JOIN ${studentAttendees}
            ON ${studentAttendees.courseId} = ${courses.id}
            WHERE ${studentAttendees.studentId} = ${user.student!.id}
          )
      ) as "totalCourse",
      (
        SELECT count(*) FROM ${attendances}
        WHERE ${attendances.id} in 
          (
            SELECT FROM ${studentAttendances}
            WHERE ${studentAttendances.studentAttendeeId} in 
            (
              SELECT ${studentAttendees.id} FROM ${studentAttendees}
              WHERE ${studentAttendees.studentId} = ${user.student!.id}
            ) AND ${studentAttendances.present} = true::BOOLEAN
          ) 
      ) as "totalAttendanceTaken",

      (
        SELECT count(*) FROM ${attendances}
        WHERE ${attendances.id} in 
          (
            SELECT FROM ${studentAttendances}
            WHERE ${studentAttendances.studentAttendeeId} in 
            (
              SELECT ${studentAttendees.id} FROM ${studentAttendees}
              WHERE ${studentAttendees.studentId} = ${user.student!.id}
            ) AND ${studentAttendances.present} = false::BOOLEAN
          ) 
      ) as "totalAttendanceMissed"
    `);

    return <div>Student Dashboard</div>;
  }
};

export default DashboardPage;
