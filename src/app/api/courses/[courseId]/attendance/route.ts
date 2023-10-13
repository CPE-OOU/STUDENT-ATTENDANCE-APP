import { db } from '@/config/db/client';
import {
  attendances,
  courses,
  lecturerAttendees,
  lecturers,
  users,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import {
  createInvalidPayloadResponse,
  getUrlQuery,
  jsonAggBuildObject,
} from '@/lib/utils';
import { differenceInMinutes } from 'date-fns';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { StatusCodes } from 'http-status-codes';
import {
  ZodError,
  date,
  number,
  object,
  string,
  boolean as zboolean,
} from 'zod';

const paramsSchema = object({
  courseId: string().uuid(),
});
const querySchema = object({
  limit: number({ coerce: true }).default(30),
  page: number({ coerce: true }).default(1),
  owned: zboolean({ coerce: true }).default(false),
});

export const GET = async (req: Request, params: unknown) => {
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

    const { limit, page } = querySchema.parse(getUrlQuery(req.url));
    const { courseId } = paramsSchema.parse(params);
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

      if (!check.isAllowedLecturer) {
        return createFailResponse(
          {
            title: 'Unauthorized',
            message: 'You are not a lecturer on this course',
          },
          StatusCodes.NOT_FOUND
        );
      }
    }

    let select;
    const at = alias(attendances, 's1');
    {
      const { id, topicTitle, createdAt } = getTableColumns(at);
      const { firstName, lastName } = getTableColumns(users);
      const attendanceSelect = jsonAggBuildObject({
        id,
        topicTitle,
        attendanceDate: createdAt,
        lectureName: sql`${firstName} ${lastName}`,
      });

      select = {
        total: sql<number>`count(*)`,
        count: sql<number>`CEIL(count(*) / ${limit})`,
        attendances:
          sql`(SELECT ${attendanceSelect} FROM ${at} OFFSET (${page} * CEIL(count(*) / ${limit}))
          LIMIT ${limit})` as typeof attendanceSelect,
      };
    }

    const classAttendances = await db
      .select(select)
      .from(courses)
      .leftJoin(lecturerAttendees, eq(lecturerAttendees.courseId, courses.id))
      .leftJoin(lecturers, eq(lecturers.id, lecturerAttendees.lecturerId))
      .leftJoin(users, eq(lecturers.userId, users.id)).where(sql`${eq(
      courses.id,
      courseId
    )}
     AND ${user.id} in (
                SELECT ${lecturers.userId} FROM ${lecturerAttendees}
                INNER JOIN ${lecturers} ON ${lecturerAttendees.lecturerId} = ${
      lecturers.id
    }
                WHERE ${lecturerAttendees.courseId} = ${courseId}
            )
      `);

    return createSuccessResponse(
      {
        title: 'Get class attendance',
        message: 'list of class attendances',
        data: classAttendances,
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[GET CLASS ATTENDANCES]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const createAttendanceBodySchema = object({
  expires: date({ coerce: true }).refine((value) => {
    const now = Date.now();
    const timeDiff = differenceInMinutes(value, now);
    value.getTime() > now &&
      timeDiff > 10 && //greater than 10 mins
      timeDiff < 60;
  }),

  topicTitle: string().min(8),
});

export const POST = async (req: Request, param: unknown) => {
  try {
    const { courseId } = paramsSchema.parse(param);
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

      if (!check.isAllowedLecturer) {
        return createFailResponse(
          {
            title: 'Unauthorized',
            message: 'Not an course assigned lecturer',
          },
          StatusCodes.NOT_FOUND
        );
      }
    }

    const { topicTitle, expires } = createAttendanceBodySchema.parse(
      await req.json()
    );

    const [attendance] = await db
      .insert(attendances)
      .values({
        lecturerAttendeeId: user.lecturer!.id,
        topicTitle,
        expires,
      })
      .returning();

    return createSuccessResponse(
      { title: 'Attendance created', data: attendance },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[CREATE CLASS ATTENDANCES]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
