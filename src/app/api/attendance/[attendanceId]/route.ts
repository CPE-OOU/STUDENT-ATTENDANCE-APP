import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  studentAttendances,
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
import { parsedEnv } from '@/config/env/validate';

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

    const [studentAttendee] = await db
      .select()
      .from(studentAttendees)
      .where(eq(studentAttendees.id, attendeeId))
      .innerJoin(students, eq(studentAttendees.studentId, students.id));

    if (!studentAttendee) {
      return createFailResponse(
        {
          title: 'Attendee',
          message: 'User not a student attendee',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    const { students: studentRecord } = studentAttendee;
    const { captures } = studentRecord;

    if (!(captures && captures.length)) {
      return createFailResponse(
        {
          title: 'Attendee',
          message: 'Student have not perform capturing',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    type FacialSuccess = {
      status: 'success';
      'face counted': number;
      'user found': boolean;
      'unknown faces': number;
      'excempted faces': number;
      message: string;
    };

    type FacialFail = {
      status: 'failed';
      message: string;
    };
    const response = await fetch(parsedEnv.CAPTURE_VERIFICATION_SERVER, {
      method: 'POST',
      body: JSON.stringify({
        records: captures,
        image: captureImgUrl,
        excemption: [],
      }),
    });

    const data: FacialSuccess | FacialFail = await response.json();

    if (data.status === 'failed') {
      return createFailResponse(
        {
          title: 'Attendee',
          message: 'An error occurred while verifing',
        },
        StatusCodes.BAD_GATEWAY
      );
    }

    if (data['user found']) {
      // db.insert(studentAttendances).values({attendanceId: acc})
    }

    return createSuccessResponse(
      {
        title: 'Get class attendees',
        message: 'list of class attendees',
        // data: course,
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
