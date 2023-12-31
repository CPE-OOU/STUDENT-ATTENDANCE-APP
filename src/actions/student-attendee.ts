'use server';

import { db } from '@/config/db/client';
import {
  lecturerAttendees,
  lecturers,
  studentAttendees,
} from '@/config/db/schema';
import { action } from '@/lib/safe-action';
import { eq, sql } from 'drizzle-orm';
import { object, string } from 'zod';

export const removeStudentAttendee = action(
  object({
    studentAttendeeId: string().uuid(),
    courseId: string().uuid(),
    actionUserId: string().uuid(),
  }),
  async ({ studentAttendeeId, courseId, actionUserId }) => {
    const [lectureAttendee] = await db.select().from(lecturerAttendees)
      .where(sql`
          ${lecturerAttendees.courseId} = ${courseId} AND ${lecturerAttendees.lecturerId} = (
                SELECT ${lecturerAttendees.lecturerId} FROM ${lecturerAttendees}
                INNER JOIN ${lecturers} ON ${lecturerAttendees.lecturerId} = ${lecturers.id}
                WHERE ${lecturerAttendees.courseId} = ${courseId} AND ${lecturers.userId} = ${actionUserId}
                LIMIT 1
          )
      `);

    if (!lectureAttendee) {
      return new Error('User not a lecturer assigned on this course');
    }

    const [removedStudentAttendee] = await db
      .delete(studentAttendees)
      .where(eq(studentAttendees.id, studentAttendeeId))
      .returning();

    if (!removedStudentAttendee) {
      return new Error('User not a student taking this course');
    }
  }
);
