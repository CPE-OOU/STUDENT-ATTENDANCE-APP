import { ClientUserForm, User } from '@/config/db/schema';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

type UserCreateAccountType = NonNullable<User['type']>;

const useRegisterUser = () => {
  return useMutation({
    mutationFn: async ({
      data,
      type,
    }: {
      data: ClientUserForm;
      type: UserCreateAccountType;
    }) => {
      const user = await axios.post(
        `/api/auth/register?accountType=${type}`,
        data
      );

      await axios.post(`/api/auth/signin`, {
        email: data.email,
        password: data.password,
      });

      return user;
    },
    onSuccess: (_, { type }) => {
      toast(`Your account as ${type} is created`);
    },
  });
};

export { useRegisterUser };
