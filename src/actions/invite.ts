'use server';

import { db } from '@/config/db/client';
import { courses } from '@/config/db/schema';
import { action } from '@/lib/safe-action';
import { object, string } from 'zod';
import { generate as generateToken } from 'otp-generator';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const generateInviteCode = action(
  object({ courseId: string().uuid() }),
  async ({ courseId }) => {
    const [course] = await db
      .update(courses)
      .set({
        inviteCode: generateToken(6, {
          digits: false,
          lowerCaseAlphabets: true,
          specialChars: false,
          upperCaseAlphabets: true,
        }),
      })
      .where(eq(courses.id, courseId))
      .returning();

    revalidatePath(`/courses/${courseId}`);
    return course;
  }
);
