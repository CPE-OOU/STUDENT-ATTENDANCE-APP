import { db } from '@/config/db/client';
import { courses, lecturerAttendees } from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { object, string } from 'zod';

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
  const course = await db
    .select({
      ...getTableColumns(courses),
      lecturerAttendee: getTableColumns(lecturerAttendees),
    })
    .from(courses)
    .where(eq(courses.id, courseId))
    .leftJoin(lecturerAttendees, whereClause);

  return <div></div>;
}
