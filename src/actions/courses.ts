'use server';

import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendees,
  students,
} from '@/config/db/schema';
import { action } from '@/lib/safe-action';
import { sql } from 'drizzle-orm';
import { object, string } from 'zod';

const input = object({
  courseId: string().uuid(),
  userId: string().uuid(),
});

export const deleteCourse = action(input, async ({ courseId, userId }) => {
  await db.delete(courses).where(sql`${courses.id} = (
      (
        SELECT ${studentAttendees.courseId} as "courseId" from ${studentAttendees}
        INNER JOIN ${students} ON ${students.id} = ${studentAttendees.studentId}
        WHERE ${students.userId} = ${userId} AND ${studentAttendees.courseId} = ${courseId}
      )
  UNION 
      (
        SELECT ${lecturerAttendees.courseId} as "courseId" from ${lecturerAttendees}
        INNER JOIN ${lecturers} ON ${lecturers.id} = ${lecturerAttendees.lecturerId}
        WHERE ${lecturers.userId} = ${userId} AND ${studentAttendees.courseId} = ${courseId}
      )
  )`);
});
