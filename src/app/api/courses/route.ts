import { db } from '@/config/db/client';
import { courses, lecturerAttendees } from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createInvalidPayloadResponse } from '@/lib/utils';
import { StatusCodes } from 'http-status-codes';
import { ZodError, object, string } from 'zod';
import { generate as generateToken } from 'otp-generator';

const bodySchema = object({
  name: string().min(10).max(128),
  courseCode: string().min(6).max(8),
});

export const POST = async (req: Request) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createFailResponse(
        {
          title: 'Unauthorized',
          message: 'User not authenicated. Kindly perform a sign in again',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    if (user.type !== 'teacher') {
      return createFailResponse(
        {
          title: 'Unauthorized',
          message: 'Resource only allowed for teachers',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    const { name, courseCode } = bodySchema.parse(await req.json());

    const course = await db.transaction(async (tx) => {
      const [course] = await tx
        .insert(courses)
        .values({
          name,
          courseCode,
          creatorId: user.lecturer!.id,
          inviteCode: generateToken(6, {
            digits: false,
            lowerCaseAlphabets: true,
            specialChars: false,
            upperCaseAlphabets: true,
          }),
        })
        .returning();

      await tx.insert(lecturerAttendees).values({
        courseId: course.id,
        lecturerId: user.lecturer!.id,
      });

      return course;
    });

    return createSuccessResponse(
      {
        title: 'Get class attendees',
        message: 'list of class attendees',
        data: course,
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[CREATE COURSE]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
