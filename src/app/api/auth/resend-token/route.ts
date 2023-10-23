import { db } from '@/config/db/client';
import { otpChangeFields } from '@/config/db/schema';
import { object, enum as enum_, ZodError, string } from 'zod';
import { NextResponse } from 'next/server';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import {
  createClientAuthTokenInfo,
  createInvalidPayloadResponse,
  evaluateAuthToken,
} from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import { authAction, authTokens } from '@/config/db/schema/authToken';
import { eq, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { Request as ExpressRequest, getClientIp } from 'request-ip';
import { generateOTP } from '@/lib/otp-generate';
import { novuNotification } from '@/lib/nov.notification';
import { parsedEnv } from '@/config/env/validate';
import { format } from 'date-fns';
const requestDataValidator = object({
  query: object({
    type: enum_(authAction.enumValues),
    changeFieldId: string().uuid().optional(),
  }),
});

export const POST = async (req: Request) => {
  try {
    const {
      query: { type, changeFieldId },
    } = requestDataValidator.parse({
      query: Object.fromEntries(new URL(req.url).searchParams),
    });

    const user = await getCurrentUser();

    if (!user) {
      return createFailResponse(
        {
          title: 'Authentication Required',
          message:
            'You must be logged in so not authenticated to access this resource.',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    if (user.emailVerified)
      return createFailResponse(
        {
          title: 'Email Verification Already Completed',
          message:
            "This email address has already been successfully verified. You don't need to verify it again.",
        },
        StatusCodes.CONFLICT
      );

    if (type === 'change-email' && !changeFieldId) {
      return createFailResponse(
        {
          title: 'Missing Query',
          message:
            'Change email is set for query type but changeFieldId query is missing',
        },
        StatusCodes.FORBIDDEN
      );
    }

    const clientIP = getClientIp(req as unknown as ExpressRequest);
    console.log(
      db
        .select()
        .from(authTokens)
        .where(
          sql`
        ${authTokens.userId} = ${user.id} 
        AND ${authTokens.action} = ${type}
        AND ${authTokens.userIp} = ${clientIP}
        ${
          type === 'change-email'
            ? sql`(SELECT ${otpChangeFields.tokenId} FROM ${otpChangeFields} 
              WHERE ${otpChangeFields.id} = ${changeFieldId} LIMIT 1) = ${authTokens.id} `
            : sql``
        }
        `
        )
        .toSQL().sql
    );

    const [tokenRecord] = await db
      .select()
      .from(authTokens)
      .where(
        sql`
        ${authTokens.userId} = ${user.id} 
        AND ${authTokens.action} = ${type}
        AND ${authTokens.userIp} = ${clientIP}
        ${
          type === 'change-email'
            ? sql`(SELECT ${otpChangeFields.tokenId} FROM ${otpChangeFields} 
              WHERE ${otpChangeFields.id} = ${changeFieldId} LIMIT 1) = ${authTokens.id} `
            : sql``
        }
        `
      );

    if (tokenRecord) {
      const { allowResend } = evaluateAuthToken(tokenRecord, {
        currentIp: clientIP,
      });

      if (!allowResend) {
        return createFailResponse(
          {
            title: 'Too Many Requests',
            message:
              '"Resend timeout has not expired yet. Please wait and try again later.',
          },
          StatusCodes.EXPECTATION_FAILED
        );
      }
    }
    let token;
    if (type === 'change-email') {
      await db.transaction(async (tx) => {
        token = await generateOTP('account-verify', user.id);
        [token] = await Promise.all([
          generateOTP('account-verify', user.id),
          novuNotification.trigger('change-email', {
            to: {
              subscriberId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            },
            payload: {
              otp: token.token,
              companyName: 'GURU',
              expiresAt: new Date().toISOString(),
            },
          }),
        ]);

        await tx
          .update(otpChangeFields)
          .set({ tokenId: token.id })
          .where(eq(otpChangeFields.id, changeFieldId!));
      });
    } else {
      token = await generateOTP('account-verify', user.id);

      await novuNotification.trigger('account-activation', {
        to: {
          subscriberId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        payload: {
          otp: token.token,
          companyName: 'GURU',
          confirmationLink: `${parsedEnv.NEXTAUTH_URL}/auth/verify-account?token=${token.token}`,
          expiresAt: `${format(new Date(token.expiresIn), 'MM')}`,
        },
      });
    }

    return createSuccessResponse(
      {
        title: 'OTP RESEND',
        message: 'A new OTP has being sent',
        data: createClientAuthTokenInfo(token!),
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[RESEND  USER AUTH TOKEN]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);
    }
    return NextResponse.json((e as any)?.message, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
