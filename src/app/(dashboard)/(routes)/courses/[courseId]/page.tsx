import { db } from '@/config/db/client';
import {
  attendances,
  courses,
  lecturerAttendees,
  studentAttendances,
  studentAttendees,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { object, string } from 'zod';
import { SideAction } from '../../account/__components/side-action';
import postgres from 'postgres';
import { Megaphone, Presentation, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActionButtons } from './__components/action-button';

const courseIdParams = object({ courseId: string().uuid() });

export default async function CourseIdPage({
  params,
}: {
  params: Record<string, string>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect('/sign-in?callbackUrl=/students');
  }

  if (user.type !== 'teacher') {
    return redirect('/');
  }

  const { courseId } = courseIdParams.parse(params);
  const whereClause = sql`
  ${courses.id} in (
      SELECT ${lecturerAttendees.courseId} FROM ${lecturerAttendees}
      WHERE ${lecturerAttendees.lecturerId} = ${user.lecturer!.id}
    )
  `;
  const [course] = await db
    .select({
      ...getTableColumns(courses),
      lecturerAttendee: getTableColumns(lecturerAttendees),
    })
    .from(courses)
    .where(eq(courses.id, courseId))
    .leftJoin(lecturerAttendees, whereClause);

  if (!course) return notFound();

  if (!course.lecturerAttendee) {
    return notFound();
  }

  const [attendanceInfo] = (await db.execute(sql`
     SELECT (
      SELECT count(*) FROM ${attendances}
      WHERE ${attendances.courseId} = ${course.id}
  ) as "totalAttendance",

      (
        SELECT count(*) FROM ${studentAttendees}
        WHERE ${studentAttendees.courseId} = ${course.id}
      ) as "totalStudentAttendee",

      (
        SELECT count(*) FROM ${lecturerAttendees}
        WHERE ${lecturerAttendees.courseId} = ${course.id}
      ) as "totalLecturerAttendee"
    `)) as postgres.RowList<
    {
      totalAttendance: number;
      totalLecturerAttendee: number;
      totalStudentAttendee: number;
    }[]
  >;

  const { totalAttendance, totalLecturerAttendee, totalStudentAttendee } =
    attendanceInfo;
  const tags = [
    {
      title: 'No of attendance taken',
      value: totalAttendance,
      icon: <Megaphone className="w-4 h-4 text-muted-foreground" />,
    },
    {
      title: 'Assigned Lecturer No',
      value: totalLecturerAttendee,
      icon: <Presentation className="w-4 h-4 text-muted-foreground" />,
    },
    {
      title: 'Registered student no',
      value: totalStudentAttendee,
      icon: <User className="w-4 h-4 text-muted-foreground" />,
    },
  ];

  return (
    <div>
      <div className="flex">
        <div className="flex-1 mt-14 px-6">
          <div className="flex mb-8 items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-[#4f4d53]">
              Course
            </h2>
            <ActionButtons
              courseId={course.id}
              user={user as any}
              lecturerAttendeeId={course.lecturerAttendee?.id ?? ''}
              // assignedStudentId={}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <Card key={tag.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {tag.title}
                  </CardTitle>

                  {tag.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tag.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 w-[480px] ">
          <SideAction user={user} />
        </div>
      </div>
    </div>
  );
}
