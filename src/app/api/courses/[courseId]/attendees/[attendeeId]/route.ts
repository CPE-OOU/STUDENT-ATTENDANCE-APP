import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  studentAttendees,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createInvalidPayloadResponse } from '@/lib/utils';
import { eq, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import postgres from 'postgres';
import { ZodError, object, string } from 'zod';

const paramSchema = object({
  courseId: string().uuid(),
  attendeeId: string().uuid(),
});

export const DELETE = async (_req: Request, params: unknown) => {
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
    const { courseId, attendeeId } = paramSchema.parse(params);
    const [courseInfo] = (await db.execute(sql`
        SELECT ${courses.id},(
            SELECT ${lecturerAttendees.id}  FROM ${lecturerAttendees}
            WHERE ${lecturerAttendees.courseId} = c1.id 
            AND ${lecturerAttendees.lecturerId} = ${user.lecturer!.id}
        )  as as "lectureAttendeeId" FROM ${courses} c1 WHERE ${
      courses.id
    } = ${courseId}
    `)) as postgres.RowList<
      [{ id: string; lectureAttendeeId: string } | undefined]
    >;

    if (!courseInfo) {
      return createFailResponse(
        { title: 'NOT FOUND', message: 'Course not found' },
        StatusCodes.NOT_FOUND
      );
    }

    if (!courseInfo.lectureAttendeeId) {
      return createFailResponse(
        {
          title: 'UNAUTHORIZED',
          message: 'Lecture not enlisted on this course',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    const [studentAttendee] = await db.select().from(studentAttendees)
      .where(sql`${studentAttendees.courseId} = ${courseId} 
      AND ${studentAttendees.id} = ${attendeeId}`);

    if (!studentAttendee) {
      return createFailResponse(
        { title: 'NOT FOUND', message: 'Student not a member of this class' },
        StatusCodes.NOT_FOUND
      );
    }

    await db
      .update(studentAttendees)
      .set({ removed: true })
      .where(eq(studentAttendees.id, studentAttendee.id));

    return createSuccessResponse(
      { title: 'Removed Successfully', message: 'Student removed succesfully' },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[REMOVE CLASS ATTENDEE]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
