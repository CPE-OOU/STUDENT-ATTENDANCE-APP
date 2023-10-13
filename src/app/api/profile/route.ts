import { db } from '@/config/db/client';
import { accountSettings, students, users } from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createInvalidPayloadResponse } from '@/lib/utils';
import { eq, getTableColumns } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { object, enum as enum_, union, string, ZodError } from 'zod';

export const GET = async () => {
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

    const [userSetting] = await db
      .select()
      .from(accountSettings)
      .where(eq(accountSettings.userId, user.id!));

    return createSuccessResponse(
      { title: 'User Profile', data: { ...user, setting: userSetting } },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[GET USER PROFILE]', e);

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const bodySchema = union([
  object({ type: enum_(['firstName']), value: string().min(1).max(64) }),
  object({ type: enum_(['lastName']), value: string().min(1).max(64) }),
  object({ type: enum_(['department']), value: string().min(2) }),
  object({ type: enum_(['level']), value: string().min(2) }),
  object({ type: enum_(['university']), value: string().min(2) }),
]);

export const PATCH = async (req: Request) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return createFailResponse(
        {
          title: 'Unauthorized',
          message: 'user not authenicated, Sign in to gain access.',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = bodySchema.parse(await req.json());
    let query;
    switch (body.type) {
      case 'firstName':
      case 'lastName': {
        query = db
          .update(users)
          .set({ [body.type]: body.value })
          .where(eq(users.id, user.id));
        break;
      }
      case 'level':
      case 'university':
      case 'department': {
        query = db
          .update(students)
          .set({ [body.type]: body.value })
          .where(eq(students.userId, user.id));
        break;
      }
    }

    if (!query) {
      return createFailResponse(
        {
          title: 'Invalid update field',
          message: 'The provided field for update is not allowed',
        },
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    await query;
    let data;
    if (user.type === 'student') {
      data = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          type: users.type,
          emailVerified: users.emailVerified,
          imageUrl: users.imageUrl,
          student: getTableColumns(students),
          setting: getTableColumns(accountSettings),
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .innerJoin(students, eq(students.userId, user.id))
        .innerJoin(accountSettings, eq(accountSettings.userId, user.id));
    } else {
      data = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          type: users.type,
          emailVerified: users.emailVerified,
          imageUrl: users.imageUrl,
          setting: getTableColumns(accountSettings),
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .innerJoin(accountSettings, eq(accountSettings.userId, user.id));
    }

    return createSuccessResponse(
      {
        title: 'Record Updated',
        message: `${body.type} Update succesfully`,
        data,
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[UPDATE PROFILE DETAIL]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }

    return createFailResponse(
      { title: 'Internal Server Error', message: (e as any)?.message },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
