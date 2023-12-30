'use server';

import { db } from '@/config/db/client';
import {
  Attendance,
  attendances,
  courses,
  expiredAfter,
  studentAttendances,
  studentAttendees,
  students,
  users,
} from '@/config/db/schema';
import { action } from '@/lib/safe-action';
import { addHours, addMinutes } from 'date-fns';
import { eq, sql, and, getTableColumns } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { object, string, z } from 'zod';

const input = createInsertSchema(attendances, {
  topicTitle: (schema) => schema.topicTitle.min(3).max(256),
  courseId: (schema) => schema.courseId.uuid(),
  lecturerAttendeeId: (schema) => schema.lecturerAttendeeId.uuid(),
  expiredAfter: () => z.enum(expiredAfter.enumValues),
}).pick({
  topicTitle: true,
  courseId: true,
  expiredAfter: true,
  lecturerAttendeeId: true,
});

export const createAttendance = action(input, async (data) => {
  const [, value, duration] = data.expiredAfter!.match(/(\d+)(.*)/)!;
  console.log({ value, duration });
  const attendance = await db.transaction(async (tx) => {
    const now = new Date();
    let expires;
    if (duration.toLowerCase() === 'min') {
      expires = addMinutes(now, +value);
    } else if (duration.toLowerCase() === 'hr') {
      expires = addHours(now, +value);
    } else {
      throw new Error('Invalid expiredAfter value');
    }

    const [attendance] = await tx
      .insert(attendances)
      .values({ ...data, expiredAfter: data.expiredAfter!, expires: expires })
      .returning();

    const attendees = await tx
      .select()
      .from(studentAttendees)
      .where(eq(studentAttendees.courseId, data.courseId));

    await tx.insert(studentAttendances).values(
      attendees.map(({ id }) => ({
        attendanceId: attendance.id,
        studentAttendeeId: id,
      }))
    );
    return attendance as Attendance;
  });

  return attendance;
});

export const verifyStudentDetail = action(
  object({ email: string().email(), courseId: string().uuid() }),
  async ({ email, courseId }) => {
    return db
      .select()
      .from(studentAttendees)
      .innerJoin(students, eq(students.id, studentAttendees.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .innerJoin(courses, eq(courses.id, studentAttendees.courseId))
      .where(
        sql`${users.email} = ${email} AND ${studentAttendees.courseId} = ${courseId} `
      );
  }
);

export const setCapturer = action(
  object({
    studentAttendeeId: string().uuid(),
    attendanceId: string().uuid(),
    courseId: string().uuid(),
  }),
  async ({ studentAttendeeId, attendanceId, courseId }) => {
    if (
      !(
        await db
          .select()
          .from(studentAttendees)
          .where(
            and(
              eq(studentAttendees.courseId, courseId),
              eq(studentAttendees.id, studentAttendeeId)
            )
          )
      ).length
    ) {
      throw new Error('User no longer a registered student for this course');
    }
    await db
      .update(attendances)
      .set({ attendanceCapturerId: studentAttendeeId })
      .where(eq(attendances.id, attendanceId));

    const { firstName, lastName, email, id: userId } = getTableColumns(users);
    const { studentId } = getTableColumns(studentAttendees);

    return (
      await db
        .select({
          firstName,
          lastName,
          email,
          id: userId,
          studentId,
        })
        .from(studentAttendees)
        .innerJoin(
          users,
          sql`${users.id} = (SELECT ${students.userId} FROM ${students}
                            WHERE ${students.id} = ${studentId})`
        )
        .where(eq(studentAttendees.id, studentAttendeeId))
    ).pop();
  }
);
