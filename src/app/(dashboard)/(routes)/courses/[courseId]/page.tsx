import { db } from '@/config/db/client';
import {
  StudentAttendee,
  attendances,
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendees,
  students,
  users,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { object, string } from 'zod';
import { SideAction } from '../../account/__components/side-action';
import postgres from 'postgres';
import { ClipboardList, Megaphone, Presentation, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButtons } from './__components/action-button';
import { AttendanceItem } from './__components/attendance-item';
import { CopyInviteCode } from './__components/copy-invite-code';
import { SelectCapturer } from './__components/choose-capturer';
import { Button } from '@/components/ui/button';
import { ActiveAttendanceItem } from '@/components/active-attendance-item';

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

  const { courseId } = courseIdParams.parse(params);
  let whereClause;

  if (user.type === 'student') {
    whereClause = sql`
    ${courses.id} in (
        SELECT ${studentAttendees.courseId} FROM ${studentAttendees}
        WHERE ${studentAttendees.studentId} = ${user.student!.id}
      )
    `;
  } else {
    whereClause = sql`
    ${courses.id} in (
        SELECT ${lecturerAttendees.courseId} FROM ${lecturerAttendees}
        WHERE ${lecturerAttendees.lecturerId} = ${user.lecturer!.id}
      )
    `;
  }

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

  const activeAttendances = await db
    .select({
      ...getTableColumns(attendances),
      createdBy: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(attendances)
    .innerJoin(
      lecturerAttendees,
      eq(lecturerAttendees.id, attendances.lecturerAttendeeId)
    )
    .innerJoin(lecturers, eq(lecturers.id, lecturerAttendees.lecturerId))
    .innerJoin(users, eq(lecturers.userId, users.id))
    .where(
      sql`${attendances.expires} > CURRENT_TIMESTAMP AND ${attendances.courseId} = ${course.id}`
    );

  const { firstName, lastName, type, imageUrl, email } = getTableColumns(users);
  const courseStudentAttendees = await db
    .select({
      firstName,
      lastName,
      type,
      imageUrl,
      email,
      ...getTableColumns(studentAttendees),
    })
    .from(studentAttendees)
    .where(eq(studentAttendees.courseId, courseId))
    .innerJoin(students, eq(studentAttendees.studentId, students.id))
    .innerJoin(users, eq(users.id, students.userId));

  const { totalAttendance, totalLecturerAttendee, totalStudentAttendee } =
    attendanceInfo;
  const tags = [
    {
      title: 'No of attendance taken',
      value: totalAttendance,
      icon: <Megaphone className="w-8 h-8 text-muted-foreground" />,
      path: `/courses/${course.id}/attendances`,
    },
    {
      title: 'Assigned Lecturer No',
      value: totalLecturerAttendee,
      icon: <Presentation className="w-8 h-8 text-muted-foreground" />,
      path: `/couses/${course.id}/attendees?role=lecturer`,
    },
    {
      title: 'Registered student no',
      value: totalStudentAttendee,
      icon: <User className="w-8 h-8 text-muted-foreground" />,
      path: `/couses/${course.id}/attendees?role=student`,
    },
  ];

  return (
    <div>
      <div className="flex">
        <div className="flex-1 mt-14 px-6 space-y-12">
          <h2 className="text-3xl font-bold tracking-tight text-[#4f4d53] flex items-center">
            Course
            <CopyInviteCode course={course} />
          </h2>
          <div className="flex justify-between flex-col gap-y-8">
            <h3 className="text-5xl font-bold tracking-tight text-[#4f4d53]">
              {course.name}
            </h3>
            <ActionButtons
              courseId={course.id}
              user={user as any}
              lecturerAttendeeId={course.lecturerAttendee?.id ?? ''}
              // assignedStudentId={}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <ActiveAttendanceItem {...tag} key={tag.path} />
            ))}
          </div>
          {/* 
          <div className="space-y-4">
            <h4 className="text-2xl font-bold tracking-tight text-[#4f4d53]">
              Assigned student for Capturing
            </h4>

            <SelectCapturer
              data={courseStudentAttendees}
              currentCapturerId={''}
              attendanceId=
            />
          </div> */}

          <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-bold tracking-tight text-[#4f4d53] flex items-center">
              Active Running Attendance
            </h3>
            <div>
              {activeAttendances.map((attendance) => (
                <AttendanceItem
                  attendance={attendance}
                  courseAttendees={courseStudentAttendees as any}
                  {...(course.lecturerAttendee && {
                    lectureAttendeeId: course.lecturerAttendee.id,
                  })}
                  {...(attendance.attendanceCapturerId && {
                    currentCapturerId: attendance.attendanceCapturerId,
                  })}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-[480px] ">
          <SideAction user={user} />
        </div>
      </div>
    </div>
  );
}
