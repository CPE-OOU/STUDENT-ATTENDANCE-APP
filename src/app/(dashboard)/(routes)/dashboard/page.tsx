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
import { LecturerDashboard } from './__components/lecturerDashboard';
import { StudentDashboard } from './__components/studentDashboard';

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
          totalCourse: number;
          totalAttendanceTaken: number;
        }
      ]
    >;

    return <LecturerDashboard {...data} user={user} />;
  } else {
    const [attendanceInfo] = (await db.execute(sql`
      WITH st AS (
      SELECT * FROM ${studentAttendances}
      INNER JOIN ${studentAttendees} ON ${studentAttendees.id} = ${
      studentAttendances.studentAttendeeId
    }
      WHERE ${studentAttendees.studentId} = ${user.student!.id}
    )
    
    SELECT 
      count(*) as "totalAttendance",
      (SELECT count(*) FROM st WHERE st.present = true::BOOLEAN) as "totalPresent",
      (SELECT count(*) FROM st WHERE st.present = false::BOOLEAN) as "totalAbsent"
    FROM st
    `)) as postgres.RowList<
      { totalAttendance: number; totalPresent: number; totalAbsent: number }[]
    >;

    const [{ totalCourse }] = (await db.execute(sql`
        SELECT count(*) as "totalCourse" FROM ${courses}
        WHERE ${courses.id} IN (
          SELECT ${studentAttendees.courseId} FROM ${studentAttendees}
          WHERE ${studentAttendees.studentId} = ${user.student!.id} 
        )
    `)) as postgres.RowList<{ totalCourse: number }[]>;

    return (
      <StudentDashboard
        {...attendanceInfo}
        totalCourse={totalCourse}
        user={user}
      />
    );
  }
};

export default DashboardPage;
