'use server';

import { db } from '@/config/db/client';
import {
  Attendance,
  attendances,
  expiredAfter,
  studentAttendances,
  studentAttendees,
  students,
  users,
} from '@/config/db/schema';
import { action } from '@/lib/safe-action';
import { addHours, addMinutes } from 'date-fns';
import { eq, sql } from 'drizzle-orm';
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
  object({ email: string().uuid(), courseId: string().uuid() }),
  async ({ email, courseId }) => {
    return db
      .select()
      .from(studentAttendees)
      .innerJoin(students, eq(students.id, studentAttendees.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .where(
        sql`${users.email} = ${email} AND ${studentAttendees.courseId} = ${courseId} `
      );
  }
);
