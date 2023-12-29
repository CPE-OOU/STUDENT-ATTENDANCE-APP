import { User } from '@/config/db/schema';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { createClientAuthTokenInfo } from '@/lib/utils';

const userAlreadyExistResponse = createFailResponse(
  { title: 'ACCOUNT ALREADY EXIST', message: '' },
  409
);

const getUserAccountCreated = (data: {
  user: User;
  otp: ReturnType<typeof createClientAuthTokenInfo>;
}) =>
  createSuccessResponse(
    {
      title: 'USER ACCOUNT CREATED',
      message: '',
      data,
    },
    200
  );

export { userAlreadyExistResponse, getUserAccountCreated };
