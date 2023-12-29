import {
  userAsLecturerFormSchema,
  userAsStudentFormSchema,
} from '@/app/(setup)/(routes)/set-up/__validator/set-up-validator';
import { db } from '@/config/db/client';
import {
  accountSettings,
  accountType,
  lecturers,
  students,
  users,
} from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createInvalidPayloadResponse } from '@/lib/utils';
import { eq, getTableColumns } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { ZodError, enum as enum_ } from 'zod';

export const PATCH = async (req: Request) => {
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

    const body = await req.json();
    const type = enum_(accountType.enumValues).parse(body.type);

    if (type === 'student') {
      const {
        profileInfo: { department, level, university, profileImage },
      } = await userAsStudentFormSchema.parse(body);

      const userAsStudent = await db.transaction(async (db) => {
        const [, , , updateUser] = await Promise.all([
          db
            .update(users)
            .set({ type, ...(profileImage && { imageUrl: profileImage }) })
            .where(eq(users.id, user.id!)),
          db
            .update(accountSettings)
            .set({ setupCompleted: true, userId: user.id! })
            .where(eq(accountSettings.userId, user.id!)),
          db
            .insert(students)
            .values({ department, level, university, userId: user.id! }),
          db
            .select({
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
              student: getTableColumns(students),
            })
            .from(users)
            .innerJoin(students, eq(students.userId, users.id)),
        ]);

        return updateUser;
      });

      return createSuccessResponse(
        {
          title: 'User record updated',
          data: userAsStudent,
          message:
            'Your record has succesfully being updated with student privilege',
        },
        StatusCodes.OK
      );
    } else if (type === 'teacher') {
      const {
        profileInfo: { formOfAddress, title, yearOfExperience, profileImage },
      } = userAsLecturerFormSchema.parse(body);

      const userAsInstructor = await db.transaction(async (tx) => {
        const [, , , updateUser] = await Promise.all([
          tx
            .update(users)
            .set({ type, ...(profileImage && { imageUrl: profileImage }) })
            .where(eq(users.id, user.id!)),
          tx
            .update(accountSettings)
            .set({ setupCompleted: true })
            .where(eq(accountSettings.userId, user.id!)),
          tx.insert(lecturers).values({
            formOfAddress,
            title,
            yearOfExperience: yearOfExperience ?? null,
            userId: user.id!,
          }),
          tx
            .select({
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
              lecturer: getTableColumns(lecturers),
            })
            .from(users)
            .innerJoin(lecturers, eq(lecturers.userId, users.id)),
        ]);

        return updateUser;
      });

      return createSuccessResponse(
        {
          title: 'User record updated',
          data: userAsInstructor,
          message:
            'Your record has succesfully being updated with lecturers privilege',
        },
        StatusCodes.OK
      );
    }

    return createFailResponse(
      { title: 'Not handled yet', message: '' },
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  } catch (e) {
    console.log('[SET UP USER ACCOUNT]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
