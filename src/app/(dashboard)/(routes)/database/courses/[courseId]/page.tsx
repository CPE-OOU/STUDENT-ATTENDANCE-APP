import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { object, string, TypeOf, z } from 'zod';
import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendees,
  students,
  users,
} from '@/config/db/schema';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { searchParamsSchema } from '@/lib/validations/params';
import { StudentAttendeeTable } from './__components/students/student-attendee-table';
import { StudentAttendeeColumns } from './__components/students/columns';

const paramsSchema = object({ courseId: string().uuid() });
const attendeeSearchParams = object({
  role: z.enum(['student', 'lecturer']).default('student'),
}).and(searchParamsSchema);

const AttendeeRecordsPage = async ({
  params,
  searchParams,
}: {
  params: TypeOf<typeof paramsSchema>;
  searchParams: { role?: 'student' | 'lecturer' | (string & {}) };
}) => {
  const user = await getCurrentUser();
  const url = headers().get('referer')!;

  if (!user) {
    return redirect(`/sign-in?callbackUrl=${url}`);
  }

  params = paramsSchema.parse(params);
  const { courseId } = params;
  const { role, offset, per_page } = attendeeSearchParams.parse(searchParams);
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId));

  if (!course) return notFound();

  if (role === 'student') {
    const { firstName, lastName, email, id: userId } = getTableColumns(users);
    const { department, level } = getTableColumns(students);
    const { id, studentId } = getTableColumns(studentAttendees);
    const [studentAttendeeListing, [{ totalCount }]] = await Promise.all([
      db
        .select({
          id,
          firstName,
          lastName,
          fullName: sql<string>`concat(${firstName}, ' ', ${lastName})`,
          email,
          userId,
          studentId,
          department,
          level,
        })
        .from(studentAttendees)
        .innerJoin(students, eq(studentAttendees.studentId, students.id))
        .innerJoin(users, eq(students.userId, users.id))
        .offset(offset)
        .limit(per_page)
        .where(eq(studentAttendees.courseId, course.id)),

      db
        .select({
          totalCount: sql<number>`CEIL(count(*)::FLOAT/${per_page})::INTEGER`,
        })
        .from(studentAttendees)
        .where(eq(studentAttendees.courseId, course.id)),
    ]);

    return (
      <StudentAttendeeTable
        data={studentAttendeeListing as any}
        totalCount={totalCount}
        user={user}
        course={course}
      />
    );
  } else {
    const { firstName, lastName, email, id: userId } = getTableColumns(users);
    const { lecturerId } = getTableColumns(lecturerAttendees);
    const [studentAttendeeListing, [{ totalCount }]] = await Promise.all([
      db
        .select({
          firstName,
          lastName,
          email,
          id: userId,
          lecturerId,
        })
        .from(lecturerAttendees)
        .innerJoin(lecturers, eq(lecturers.id, lecturerAttendees.lecturerId))
        .innerJoin(users, eq(lecturers.userId, users.id))
        .offset(offset)
        .limit(per_page)
        .where(eq(lecturerAttendees.courseId, course.id)),

      db
        .select({
          totalCount: sql<number>`CEIL(count(*)::FLOAT/${per_page})::INTEGER`,
        })
        .from(lecturerAttendees)
        .where(eq(lecturerAttendees.courseId, course.id)),
    ]);

    console.log({ studentAttendeeListing });
  }

  return <div></div>;
};

export default AttendeeRecordsPage;
