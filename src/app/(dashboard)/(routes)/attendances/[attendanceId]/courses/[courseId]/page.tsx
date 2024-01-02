import { db } from '@/config/db/client';
import {
  attendances,
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendances,
  studentAttendees,
  students,
  users,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { SelectResultField, jsonBuildObject } from '@/lib/utils';
import { searchParamsSchema } from '@/lib/validations/params';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { TypeOf, object, string } from 'zod';
import { StudentTakenAttendanceTable } from './__components/attendance-table';
import { format } from 'date-fns';
const currentPageSearchParams = searchParamsSchema;
const paramsSchema = object({
  courseId: string().uuid(),
  attendanceId: string().uuid(),
});

const StudendAttendancePage = async ({
  searchParams,
  params,
}: {
  params: TypeOf<typeof paramsSchema>;
  searchParams: TypeOf<typeof currentPageSearchParams>;
}) => {
  params = paramsSchema.parse(params);
  searchParams = currentPageSearchParams.parse(searchParams);
  const { offset, per_page } = searchParams;
  const { courseId, attendanceId: paramAttendanceId } =
    paramsSchema.parse(params);
  const user = await getCurrentUser();
  const url = headers().get('referer')!;

  if (!user) {
    return redirect(`/sign-in?callbackUrl=${url}`);
  }

  const [[course], [courseAttendance]] = await Promise.all([
    db.select().from(courses).where(eq(courses.id, courseId)),
    db
      .select()
      .from(attendances)
      .where(
        sql`${attendances.id} = ${paramAttendanceId} AND ${attendances.courseId} = ${courseId}`
      ),
  ]);

  if (!(course && courseAttendance)) return notFound();

  const {
    topicTitle,
    id: attendanceId,
    lecturerAttendeeId,
  } = getTableColumns(attendances);
  const {
    firstName,
    lastName,
    email,
    imageUrl,
    id: userId,
  } = getTableColumns(users);
  const {
    present,
    joinTime,
    id: studentAttendanceId,
  } = getTableColumns(studentAttendances);

  const { title, formOfAddress } = getTableColumns(lecturers);

  const lectureAssigneeSelect = jsonBuildObject({
    id: lecturerAttendees.id,
    title,
    formOfAddress,
    firstName,
    lastName,
    email,
    imageUrl,
    userId,
    lecturerId: lecturers.id,
  });

  const { level, department, university } = getTableColumns(students);

  const studentCapturerSelect = jsonBuildObject({
    id: studentAttendees.id,
    firstName,
    lastName,
    email,
    imageUrl,
    userId,
    studentId: students.id,
  });

  const [takenAttendanceListing, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: studentAttendanceId,
        fullName: sql<string>`concat(${firstName}, ' ', ${lastName})`,
        present,
        joinTime,
        level,
        department,
        university,
        studentAttendanceId,
        attendanceId,
        lecturerAttendeeId,
        lectureAttendee: sql<SelectResultField<typeof lectureAssigneeSelect>>`(
          SELECT ${lectureAssigneeSelect} FROM ${lecturerAttendees}
          INNER JOIN ${lecturers} ON ${lecturers.id} = ${lecturerAttendees.lecturerId}
          INNER JOIN ${users} ON ${users.id} = ${lecturers.userId}
          WHERE ${lecturerAttendees.id} = ${lecturerAttendeeId}
          )`,

        attendanceTakenBy: sql<SelectResultField<typeof studentCapturerSelect>>`
        (SELECT ${studentCapturerSelect} FROM ${studentAttendees}
        INNER JOIN ${students} ON ${students.id} = ${studentAttendees.studentId}
        INNER JOIN ${users} ON ${users.id} = ${students.userId}
        WHERE ${studentAttendees.id} = ${attendances.attendanceCapturerId}
      )
        `,
      })
      .from(studentAttendances)
      .innerJoin(
        studentAttendees,
        eq(studentAttendees.id, studentAttendances.studentAttendeeId)
      )
      .innerJoin(students, eq(students.id, studentAttendees.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .innerJoin(
        attendances,
        eq(attendances.id, studentAttendances.attendanceId)
      )
      .offset(offset)
      .limit(per_page)
      .where(eq(studentAttendances.attendanceId, attendanceId)),

    db
      .select({
        totalCount: sql<number>`CEIL(count(*)::FLOAT/${per_page})::INTEGER`,
      })
      .from(studentAttendances)
      .innerJoin(
        attendances,
        eq(attendances.id, studentAttendances.attendanceId)
      )
      .where(eq(studentAttendances.attendanceId, attendanceId)),
  ]);

  return (
    <div className="pt-14">
      <div className="px-8">
        <div className="space-y-4">
          <h4 className="text-2xl font-semibold leaing-[120%] uppercase">
            {course.name}
          </h4>

          <div className="space-y-2">
            <p className="text-xm text-neutral-600 font-semibold capitalize">{`Attendance taken for ${courseAttendance.topicTitle}`}</p>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm lowercase">{`Attendance taken time - ${format(
                new Date(courseAttendance.createdAt!),
                'd/MM/yyyy:HH:mm'
              )}`}</p>
              <p className="text-muted-foreground text-sm lowercase">{`Attendance end time - ${format(
                new Date(courseAttendance.expires!),
                'd/MM/yyyy:HH:mm'
              )}`}</p>
            </div>
          </div>
        </div>
      </div>
      <StudentTakenAttendanceTable
        totalCount={totalCount}
        course={course}
        data={takenAttendanceListing as any}
        user={user}
      />
    </div>
  );
};

export default StudendAttendancePage;
