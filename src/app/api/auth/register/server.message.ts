import { User } from '@/config/db/schema';
import { createFailResponse, createSuccessResponse } from '@/lib/response';

const userAlreadyExistResponse = createFailResponse(
  { title: 'ACCOUNT ALREADY EXIST', message: '' },
  409
);

const getUserAccountCreated = (user: User) =>
  createSuccessResponse(
    {
      title: 'USER ACCOUNT CREATED',
      message: '',
      data: user,
    },
    200
  );

export { userAlreadyExistResponse, getUserAccountCreated };
