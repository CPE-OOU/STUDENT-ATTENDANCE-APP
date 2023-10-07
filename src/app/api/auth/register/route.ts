import { db } from '@/config/db/client';
import { createNewUserValidator, users } from '@/config/db/schema';
import { object, enum as enum_, ZodError } from 'zod';
import { getUserAccountCreated } from './server.message';
import { NextResponse } from 'next/server';

import { getRecordAlreadyExistResponse } from '@/lib/response';
import { createInvalidPayloadResponse } from '@/lib/utils';

const queryValidator = object({
  accountType: enum_(users.type.enumValues),
});

const requestDataValidator = object({
  body: createNewUserValidator,
  query: queryValidator,
});

export const POST = async (req: Request) => {
  try {
    const {
      body: regFormData,
      query: { accountType },
    } = await requestDataValidator.parseAsync({
      body: await req.json(),
      query: Object.fromEntries(new URL(req.url).searchParams),
    });

    const { firstName, lastName, email, hashedPassword, image, salt } =
      regFormData;

    const [newUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email,
        image: image ?? null,
        hashedPassword,
        type: accountType,
        passwordSalt: salt,
      })
      .returning();

    return getUserAccountCreated(newUser);
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
    return NextResponse.json((e as any)?.message);
  }
};
