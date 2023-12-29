import { db } from '@/config/db/client';
import { addresses } from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { Country } from 'country-state-city';
import { StatusCodes } from 'http-status-codes';
import { object, string } from 'zod';

const addressFormSchema = object({
  address: string(),
  country: string().refine(
    (value) => Country.getCountryByCode(value) !== undefined,
    { message: 'Invalid country type' }
  ),
  state: string().optional().nullable().default(null),
  city: string().optional().nullable().default(null),
});

export const POST = async (req: Request) => {
  try {
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

    const data = addressFormSchema.parse(await req.json());
    const [userAddress] = await db
      .insert(addresses)
      .values({
        userId: user.id,
        ...data,
      })
      .onConflictDoUpdate({
        target: addresses.userId,
        set: {
          userId: user.id,
          address: data.address,
          state: data.state,
          country: data.country,
          city: data.city,
        },
      })
      .returning();

    return createSuccessResponse(
      {
        title: 'Address Update',
        message: 'User address is succesfully updated',
        data: userAddress,
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[UPDATE ADDRESS FAILED]', e);
    return createFailResponse(
      {
        title: 'Internal Server Error',
        message: 'Something happen while updating your address',
      },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
