import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  studentAttendees,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  };
}

const InviteCodePage = async ({
  params: { inviteCode },
}: InviteCodePageProps) => {
  let user = await getCurrentUser();

  if (!user) {
    return redirect(`/sign-in?callbackUrl=/invite/${inviteCode}`);
  }

  const [course] = await db
    .select({
      ...getTableColumns(courses),
      studentAttendees: getTableColumns(studentAttendees),
      lecturerAttendees: getTableColumns(lecturerAttendees),
    })
    .from(courses)
    .where(eq(courses.inviteCode, inviteCode))
    .leftJoin(
      studentAttendees,
      sql`${studentAttendees.studentId} = ${user.student!.id} AND ${
        studentAttendees.courseId
      } = ${courses.id}`
    )
    .leftJoin(
      lecturerAttendees,
      sql`${lecturerAttendees.lecturerId} = ${user.lecturer!.id} AND ${
        studentAttendees.courseId
      } = ${courses.id}`
    );

  if (!course) {
    return notFound();
  }

  if (course.studentAttendees || course.lecturerAttendees) {
    return redirect(`/courses/${course.id}`);
  }

  if (user.student) {
    await db.insert(studentAttendees).values({
      courseId: course.id,
      studentId: user.student.id,
    });
  } else {
    await db.insert(lecturerAttendees).values({
      courseId: course.id,
      lecturerId: user.lecturer!.id,
    });
  }

  return redirect(`/courses/${course.id}`);
};

export default InviteCodePage;
