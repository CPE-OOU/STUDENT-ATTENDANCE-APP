'use server';

import { db } from '@/config/db/client';
import { attendances } from '@/config/db/schema';
import { action } from '@/lib/safe-action';
import { createInsertSchema } from 'drizzle-zod';

const input = createInsertSchema(attendances, {
  topicTitle: (schema) => schema.topicTitle.min(3).max(256),
  courseId: (schema) => schema.courseId.uuid(),
  lecturerAttendeeId: (schema) => schema.lecturerAttendeeId.uuid(),
});

export const createAttendance = action(input, async (data) => {
  const [attendance] = await db
    .insert(attendances)
    .values(data as any)
    .returning();
  return attendance;
});
