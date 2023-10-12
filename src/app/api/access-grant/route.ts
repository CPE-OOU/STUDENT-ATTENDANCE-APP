import { db } from '@/config/db/client';
import {
  accessGrantAction,
  accessGrants,
} from '@/config/db/schema/access-grant';
import { getCurrentUser, verifyPassword } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { addMinutes } from 'date-fns';
import { eq, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { object, enum as enum_, ZodError, string } from 'zod';
import { generate as generateToken } from 'otp-generator';
import { createInvalidPayloadResponse } from '@/lib/utils';
import { NextResponse } from 'next/server';
import { users } from '@/config/db/schema';

const grantBodySchema = object({
  action: enum_(accessGrantAction.enumValues),
  password: string().min(8),
});

export const POST = async (req: Request) => {
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

    const { action, password } = grantBodySchema.parse(await req.json());

    const [userWithPassword] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (!userWithPassword) {
      return createFailResponse(
        {
          title: 'Unauthorized',
          message: 'user not authenicated, Sign in to gain access.',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    if (!(await verifyPassword(userWithPassword, password))) {
      return createFailResponse(
        {
          title: 'Invalid Password',
          message:
            'Your current password is incorrect. Please try entering your password again.',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    const grantToken = generateToken(8, {
      digits: false,
      specialChars: false,
    });

    await db.delete(accessGrants).where(
      sql`(${accessGrants.used} = false::BOOLEAN 
        or ${accessGrants.expiresIn} > CURRENT_TIMESTAMP)
        and ${accessGrants.userId} = ${user.id}`
    );

    await db.insert(accessGrants).values({
      action,
      grantToken,
      userId: user.id,
      expiresIn: addMinutes(new Date(), 30),
    });

    return createSuccessResponse(
      {
        title: 'Access Granted',
        message: `You are grant access to perform ${action}`,
        data: { grantToken },
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[GET ACCESS GRANT]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }
    return NextResponse.json('An error occured while requesting grant', {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
