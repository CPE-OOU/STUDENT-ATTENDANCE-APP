import { db } from '@/config/db/client';
import {
  attendances,
  courses,
  lecturerAttendees,
  studentAttendances,
  studentAttendees,
  students,
} from '@/config/db/schema';
import { parsedEnv } from '@/config/env/validate';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createInvalidPayloadResponse, jsonBuildObject } from '@/lib/utils';
import { eq, getTableColumns, and, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { ZodError, object, string } from 'zod';

const paramSchema = object({
  courseId: string().uuid(),
  attendanceId: string().uuid(),
  attendeeId: string().url(),
});

const bodySchema = object({ currentCapture: string().url() });
type FacialResponseSuccess = {
  status: 'success';
  'faces counted': number;
  'user found': true;
  'unknown faces': number;
  'excempted faces': number;
  message: string;
};

type FacialResponseFail = {
  status: 'failed';
  message: string;
};

export const POST = async (req: Request, { params }: { params: unknown }) => {
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

    const { courseId, attendanceId, attendeeId } = paramSchema.parse(params);

    const studentSelect = {
      ...getTableColumns(studentAttendees),
      ...getTableColumns(students),
    };

    const [course] = await db
      .select({
        ...getTableColumns(courses),
        student: jsonBuildObject(studentSelect),
      })
      .from(courses)
      .leftJoin(
        studentAttendees,
        and(
          eq(studentAttendees.studentId, studentAttendances),
          eq(studentAttendees.studentId, user.student!.id)
        )
      )
      .leftJoin(students, eq(studentAttendees.studentId, students.id))
      .where(eq(courses.id, courseId));
    if (!course) {
      return createFailResponse(
        { title: 'Course not found', message: "Course doesn't exist" },
        StatusCodes.NOT_FOUND
      );
    }

    if (!course.student) {
      return createFailResponse(
        {
          title: 'Not a member',
          message: 'Student not a member of this course',
        },
        StatusCodes.NOT_FOUND
      );
    }

    if (!course.student.captures?.length) {
      return createFailResponse(
        { title: 'Capture Failed', message: 'Student as missing capturing' },
        StatusCodes.UNAUTHORIZED
      );
    }

    const [attendance] = await db
      .select()
      .from(attendances)
      .where(eq(attendances.id, attendanceId));

    if (!attendance) {
      return createFailResponse(
        {
          title: 'Attendance not found',
          message: 'Attendance not exist or removed',
        },
        StatusCodes.NOT_FOUND
      );
    }

    if (new Date(attendance.expires).getTime() < Date.now()) {
      return createFailResponse(
        {
          title: 'Attendance expired',
          message: 'No longer taking attendance',
        },
        StatusCodes.FORBIDDEN
      );
    }

    const { currentCapture } = bodySchema.parse(await req.json());

    const response = await fetch(parsedEnv.CAPTURE_VERIFICATION_SERVER, {
      method: 'POST',
      body: JSON.stringify({
        records: course.student.captures,
        image: currentCapture,
        excemption: [],
      }),
    });

    if (response.ok) {
      const payload: FacialResponseSuccess | FacialResponseFail =
        await response.json();

      if (payload.status === 'success') {
        if (payload['user found']) {
          await db
            .insert(studentAttendances)
            .values({
              studentAttendeeId: attendeeId,
              attendanceId: attendanceId,
              present: true,
            })
            .onConflictDoUpdate({
              set: { present: true },
              target: studentAttendances.studentAttendeeId,
            });

          return createSuccessResponse(
            {
              title: 'User verification completed',
              message: 'user verification completed',
            },
            StatusCodes.OK
          );
        } else {
          return createFailResponse(
            {
              title: 'Capture Failed',
              message: 'User not a match',
            },
            StatusCodes.UNAUTHORIZED
          );
        }
      }
    }
    return createFailResponse(
      {
        title: 'Capture Error',
        message: 'An error occurred while verifing capturing',
      },
      StatusCodes.BAD_GATEWAY
    );
  } catch (e) {
    console.log('[CAPTURING VERIFICATION]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
