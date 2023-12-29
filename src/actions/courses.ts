'use server';

import { db } from '@/config/db/client';
import { courses, lecturerAttendees } from '@/config/db/schema';
import { action } from '@/lib/safe-action';
import { sql } from 'drizzle-orm';
import { object, string } from 'zod';

const input = object({
  courseId: string().uuid(),
  lecturerId: string().uuid(),
});

export const deleteCourse = action(input, async ({ courseId, lecturerId }) => {
  await db.delete(courses)
    .where(sql`${courses.id} = ${courseId} AND ${courses.id} in (
    SELECT ${lecturerAttendees.courseId} FROM ${lecturerAttendees}
    WHERE ${lecturerAttendees.lecturerId} = ${lecturerId}
  )`);
});
