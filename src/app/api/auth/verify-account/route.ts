import { db } from '@/config/db/client';
import { users } from '@/config/db/schema';
import { object, enum as enum_, ZodError, string } from 'zod';
import { NextResponse } from 'next/server';

import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createInvalidPayloadResponse } from '@/lib/utils';
import { TOKEN_LENGTH } from '@/lib/constant';
import { getCurrentUser } from '@/lib/auth';
import { authTokens } from '@/config/db/schema/authToken';
import { eq, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';

const requestDataValidator = object({
  body: object({ token: string().length(TOKEN_LENGTH) }),
});

export const POST = async (req: Request) => {
  try {
    const {
      body: { token },
    } = requestDataValidator.parse({
      body: await req.json(),
    });

    const user = await getCurrentUser();

    if (!user) {
      return createFailResponse(
        {
          title: 'Unauthorized',
          message: 'user not authenicated. Reauthenicated to access resource',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    if (user.emailVerified)
      return createFailResponse(
        {
          title: 'Email Verification Conflict',
          message:
            'The email address has already been verified. You cannot verify it again.',
        },
        StatusCodes.CONFLICT
      );

    const [tokenRecord] = await db
      .select()
      .from(authTokens)
      .where(
        sql`
        ${authTokens.userId} = ${user.id} 
        AND ${authTokens.token} = ${token}
        AND ${authTokens.action} = 'account-verify'
    `
      );

    if (!tokenRecord) {
      console.log('good');
      return createFailResponse(
        {
          title: 'INVALID TOKEN',
          message:
            'The authentication token is Invalid. Please obtain a new token.',
        },
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    if (new Date(tokenRecord.expiresIn) < new Date()) {
      await db.delete(authTokens).where(eq(authTokens.id, tokenRecord.id));
      return createFailResponse(
        {
          title: 'Unauthorized',
          message:
            'The authentication token has expired. Please obtain a new token.',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    const [verifiedUser] = await db.transaction(async (tx) => {
      await tx.delete(authTokens).where(eq(authTokens.id, tokenRecord.id));
      return tx
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.id, user.id))
        .returning();
    });

    return createSuccessResponse(
      {
        title: 'VERIFICATION COMPLETED',
        message: 'Email verification successful. Your email is now verified.',
        data: verifiedUser,
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[VERIFY USER ACCOUNT]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }
    return NextResponse.json((e as any)?.message, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
