import { db } from '@/config/db/client';
import { createNewUserValidator, users } from '@/config/db/schema';
import { object, ZodError } from 'zod';
import { getUserAccountCreated } from './server.message';
import { NextResponse } from 'next/server';

import { getRecordAlreadyExistResponse } from '@/lib/response';
import {
  createClientAuthTokenInfo,
  createInvalidPayloadResponse,
} from '@/lib/utils';
import { novuNotification } from '@/lib/nov.notification';
import { generateOTP } from '@/lib/otp-generate';
import { parsedEnv } from '@/config/env/validate';
import { getClientIp, Request as ExpressRequest } from 'request-ip';
import { StatusCodes } from 'http-status-codes';

const requestDataValidator = object({
  body: createNewUserValidator,
});

export const POST = async (req: Request) => {
  try {
    const regFormData = (
      await requestDataValidator.parseAsync({
        body: await req.json(),
      })
    ).body;

    const { firstName, lastName, email, hashedPassword, salt } = regFormData;
    const [newUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email,
        hashedPassword,
        passwordSalt: salt,
      })
      .returning();

    const token = await generateOTP(
      'account-verify',
      newUser.id,
      getClientIp(req as unknown as ExpressRequest)
    );

    await novuNotification.trigger('account-activation', {
      to: {
        subscriberId: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
      payload: {
        otp: token.token,
        companyName: 'GURU',
        confirmationLink: `${parsedEnv.NEXTAUTH_URL}/auth/verify-account?token=${token.token}`,
        expiresAt: new Date().toISOString(),
      },
    });

    return getUserAccountCreated({
      user: newUser,
      otp: createClientAuthTokenInfo(token),
    });
  } catch (e) {
    console.log('[CREATE USER ACCOUNT]', e);
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
