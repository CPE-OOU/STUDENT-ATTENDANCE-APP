import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  studentAttendees,
  students,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createInvalidPayloadResponse } from '@/lib/utils';
import { StatusCodes } from 'http-status-codes';
import { ZodError, object, string } from 'zod';
import { generate as generateToken } from 'otp-generator';
import { eq } from 'drizzle-orm';

const bodySchema = object({
  captureImgUrl: string().min(10).max(128),
  attendeeId: string().uuid(),
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

    const { attendeeId, captureImgUrl } = bodySchema.parse(await req.json());

    const [attendance] = await db
      .select()
      .from(studentAttendees)
      .where(eq(studentAttendees.id, attendeeId))
      .innerJoin(students, eq(studentAttendees.studentId, students.id));

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
