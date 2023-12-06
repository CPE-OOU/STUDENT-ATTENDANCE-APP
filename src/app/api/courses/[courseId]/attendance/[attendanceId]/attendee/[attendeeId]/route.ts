import { db } from '@/config/db/client';
import {
  courses,
  lecturerAttendees,
  lecturers,
  studentAttendees,
  students,
  users,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import {
  createInvalidPayloadResponse,
  getUrlQuery,
  jsonAggBuildObject,
} from '@/lib/utils';
import { asc, eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { StatusCodes } from 'http-status-codes';
import { ZodError, number, object, string, boolean as zboolean } from 'zod';

const querySchema = object({
  limit: number({ coerce: true }).default(30),
  page: number({ coerce: true }).default(1),
  owned: zboolean({ coerce: true }).default(false),
});

const paramsSchema = object({
  courseId: string().uuid(),
  attendanceId: string().uuid(),
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
    const { courseId, attendanceId } = paramsSchema.parse(params);
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

    let select;
    const st = alias(studentAttendees, 's1');
    {
      const { firstName, lastName, email } = getTableColumns(users);
      const { level, department } = getTableColumns(students);
      const studentSelect = jsonAggBuildObject({
        firstName,
        lastName,
        email,
        level,
        department,
      });

      select = {
        total: sql<number>`count(*)`,
        count: sql<number>`CEIL(count(*) / ${limit})`,
        students:
          sql`(SELECT ${studentSelect} FROM ${st} OFFSET (${page} * CEIL(count(*) / ${limit}))
          LIMIT ${limit})` as typeof studentSelect,
      };
    }

    const classAttendees = await db
      .select(select)
      .from(st)
      .innerJoin(students, eq(st.studentId, students.id))
      .innerJoin(users, eq(users.id, students.userId))
      .where(
        sql`${eq(st.courseId, courseId)} AND ${st.id} = ${attendanceId}
        AND ${user.id} in (
          SELECT ${lecturers.userId} FROM ${lecturerAttendees} 
          INNER JOIN ${lecturers} ON ${lecturers.id} = ${
          lecturerAttendees.lecturerId
        }
          WHERE ${lecturerAttendees.courseId} = ${courseId}
          )
      `
      )
      .orderBy(asc(st.createdAt));

    return createSuccessResponse(
      {
        title: 'Get a specific class attendee',
        message: 'list of class attendees',
        data: classAttendees,
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
