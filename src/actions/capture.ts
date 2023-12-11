'use server';

import { action } from '@/lib/safe-action';
import { object, string } from 'zod';
import { db } from '@/config/db/client';
import { students } from '@/config/db/schema';
import { eq } from 'drizzle-orm';

const input = object({
  userId: string().uuid(),
  captureUrl: string().url(),
});

export const updateCapture = action(input, async function updateCapture(data) {
  const [student] = await db
    .update(students)
    .set({ captures: [data.captureUrl] })
    .where(eq(students.userId, data.userId))
    .returning();

  return { student };
});
