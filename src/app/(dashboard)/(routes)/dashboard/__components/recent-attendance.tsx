import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/config/db/client';
import {
  attendances,
  lecturerAttendees,
  lecturers,
  studentAttendees,
  students,
  users,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { capitialize } from '@/lib/utils';
import { format } from 'date-fns';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export const RecentAttendance = async () => {
  const user = await getCurrentUser();
  if (!user) return redirect('/sign-in');
  const { firstName, lastName } = getTableColumns(users);
  const { title } = getTableColumns(lecturers);
  const { id, topicTitle, createdAt } = getTableColumns(attendances);
  const recentAttendance = await db
    .select({
      id,
      topicTitle,
      lectureTitle: title,
      lectureName: sql<string>`concat(${firstName}, ' ', ${lastName})`,
      createdAt,
    })
    .from(attendances)
    .innerJoin(
      lecturerAttendees,
      eq(lecturerAttendees.id, attendances.lecturerAttendeeId)
    )
    .innerJoin(lecturers, eq(lecturerAttendees.lecturerId, lecturers.id))
    .innerJoin(users, eq(users.id, lecturers.userId))
    .where(
      sql`
    ${attendances.courseId} in 
    ((
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
  
    `
    )
    .orderBy(desc(attendances.createdAt))
    .limit(8);

  return (
    <div className="flex flex-col">
      <div className="text-base font-semibold leading-5 ">
        Recent Attendance
      </div>
      <ScrollArea className="h-[524px]">
        <div className="flex flex-col gap-y-2 mt-8">
          {recentAttendance.length ? (
            recentAttendance.map(
              ({ topicTitle, lectureName, lectureTitle, id, createdAt }) => (
                <Card
                  key={id}
                  className="bg-[#FFFFFF] flex justify-between items-start"
                >
                  <CardHeader className="flex flex-col gap-y-1">
                    <CardTitle className="text-[#3F3F44]">
                      {topicTitle}
                    </CardTitle>
                    <CardDescription className="text-[#3F3F44]/80">
                      {capitialize(lectureTitle)}.{lectureName}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="text-[#3F3F44]/50">
                    {format(new Date(createdAt!), 'HH:MM:SS')}
                  </CardFooter>
                </Card>
              )
            )
          ) : (
            <div className="mt-14 text-center text-slate-600 text-sm">
              No recent attendance taken
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
