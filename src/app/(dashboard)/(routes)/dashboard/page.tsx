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
    //<ArchiveX />
    //<Card>
    {
      /* <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
<CardTitle className="text-sm font-medium">
  Total Revenue
</CardTitle>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="2"
  className="h-4 w-4 text-muted-foreground"
>
  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
</svg>
</CardHeader>
<CardContent>
<div className="text-2xl font-bold">$45,231.89</div>
<p className="text-xs text-muted-foreground">
  +20.1% from last month
</p>
</CardContent>
</Card> */
    }
    return <div>Student Dashboard</div>;
  }
};

export default DashboardPage;
