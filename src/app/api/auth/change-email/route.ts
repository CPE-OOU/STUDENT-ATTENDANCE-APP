import { create } from 'zustand';
import { db } from '@/config/db/client';
import { otpChangeFields } from '@/config/db/schema';
import { object, string, ZodError } from 'zod';
import { NextResponse } from 'next/server';

import {
  createFailResponse,
  createSuccessResponse,
  getRecordAlreadyExistResponse,
} from '@/lib/response';
import {
  createClientAuthTokenInfo,
  createInvalidPayloadResponse,
} from '@/lib/utils';
import { novuNotification } from '@/lib/nov.notification';
import { generateOTP } from '@/lib/otp-generate';
import { getClientIp, Request as ExpressRequest } from 'request-ip';
import { StatusCodes } from 'http-status-codes';
import { getCurrentUser } from '@/lib/auth';
import { addMinutes } from 'date-fns';
import { accessGrants } from '@/config/db/schema/access-grant';
import { and, eq, not } from 'drizzle-orm';

const requestDataValidator = object({
  grantToken: string().min(8),
  newEmail: string().email(),
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
    const regFormData = await requestDataValidator.parseAsync(await req.json());

    const [grantToken] = await db
      .select()
      .from(accessGrants)
      .where(
        and(
          eq(accessGrants.grantToken, regFormData.grantToken),
          eq(accessGrants.userId, user.id),
          not(eq(accessGrants.used, true)),
          eq(accessGrants.action, 'change-email')
        )
      );

    if (!grantToken) {
      return createFailResponse(
        {
          title: 'Unauthorized',
          message: 'You are not allowed to perform this action',
        },
        StatusCodes.UNAUTHORIZED
      );
    }

    const [otpToken, otpChangeField] = await db.transaction(async () => {
      const token = await generateOTP(
        'change-email',
        user.id,
        getClientIp(req as unknown as ExpressRequest)
      );

      const [changeField] = await db
        .insert(otpChangeFields)
        .values({
          expiresIn: addMinutes(new Date(), 30),
          value: token,
          tokenId: token.id,
          type: 'change-email',
          userId: user.id,
          grantId: grantToken.id,
        })
        .returning();

      await novuNotification.trigger('change-email', {
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
      });
      return [token, changeField];
    });

    return createSuccessResponse(
      {
        title: 'Email confirmation',
        message: 'We should sent an OTP code to the input email',
        data: {
          ...createClientAuthTokenInfo(otpToken),
          identifier: otpChangeField.id,
        },
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[CHANGE EMAIL]', e);
    if (Object(e) === e) {
      if (e instanceof ZodError) return createInvalidPayloadResponse(e);

      if ((e as { code?: string })?.code) {
        const code = (e as { code?: string })?.code as string;
        if (code.toLowerCase() === '23505') {
          return getRecordAlreadyExistResponse({
            title: 'USER ALREADY EXIST',
            message: 'A user already registered with this same email',
          });
        }
      }
    }
    return NextResponse.json((e as any)?.message, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
