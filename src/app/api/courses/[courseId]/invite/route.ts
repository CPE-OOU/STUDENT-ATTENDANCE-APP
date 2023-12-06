import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendees,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createInvalidPayloadResponse, getUrlQuery } from '@/lib/utils';
import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { StatusCodes } from 'http-status-codes';
import { ZodError, enum as enum_, object, string } from 'zod';
import { generate as generateToken } from 'otp-generator';
import { PostgresError } from 'postgres';

const paramSchema = object({
  courseId: string().uuid(),
});

const querySchema = object({ action: enum_(['regenerate', 'block']) });

export const GET = async (req: Request, { params }: { params: unknown }) => {
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

    const { courseId } = paramSchema.parse(params);
    {
      const c1 = alias(courses, 'c1');
      const [check] = await db
        .select({
          isAllowedLecturer: sql<boolean>`
        CASE
          WHEN ${user.id} in (SELECT ${lecturers.userId} FROM ${c1}) THEN true::BOOLEAN
          ELSE false::BOOLEAN
        END
        )`,
        })
        .from(c1)
        .where(eq(c1.id, courseId))
        .innerJoin(lecturerAttendees, eq(lecturerAttendees.courseId, c1.id))
        .innerJoin(lecturers, eq(lecturers.id, lecturerAttendees.lecturerId));

      if (!check) {
        return createFailResponse(
          { title: 'Course not found', message: "Course doesn't exist" },
          StatusCodes.NOT_FOUND
        );
      }
    }

    const { action } = querySchema.parse(getUrlQuery(req.url));
    const [{ inviteCode }] = await db
      .update(courses)
      .set({
        ...(action === 'regenerate' && {
          inviteCode: generateToken(6, {
            digits: false,
            lowerCaseAlphabets: true,
            specialChars: false,
            upperCaseAlphabets: true,
          }),
          inviteCodeDisabled: true,
        }),
        ...(action === 'block' && { inviteCodeDisabled: true }),
      })
      .returning({
        inviteCode: courses.inviteCode,
        inviteCodeDisabled: courses.inviteCodeDisabled,
      });

    return createSuccessResponse(
      {
        title: 'Change invite code',
        message: 'Invite code as being succesfully changes',
        data: { inviteCode },
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[GENERATE INVITE CODE]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
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

    const { courseId } = paramSchema.parse(params);

    const c1 = alias(courses, 'c1');

    const [course] = await db.select().from(c1).where(eq(c1.id, courseId));
    if (!course) {
      return createFailResponse(
        { title: 'Course not found', message: "Course doesn't exist" },
        StatusCodes.NOT_FOUND
      );
    }

    let member;

    if (user.type === 'teacher') {
      [member] = await db
        .insert(lecturerAttendees)
        .values({ courseId: course.id, lecturerId: user.lecturer!.id });
    } else {
      [member] = await db.insert(studentAttendees).values({
        courseId: course.id,
        studentId: user.student!.id,
      });
    }

    return createSuccessResponse(
      {
        title: 'User added',
        message: 'User now added as part of this course',
        data: { member },
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[JOIN VIA INVITE]', e);

    if (Object(e) === e) {
      if (
        e instanceof PostgresError &&
        e.message.toLowerCase().includes('duplicate key value')
      ) {
        return createFailResponse(
          {
            title: 'User already created',
            message: 'user already part of this course',
          },
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
