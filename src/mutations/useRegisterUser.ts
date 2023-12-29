import { ClientUserForm, User } from '@/config/db/schema';
import { FailedServerResponsePayload } from '@/lib/response';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const useRegisterUser = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: ClientUserForm }) => {
      const user = await axios.post<User>(`/api/auth/register`, data);

      await axios.post(`/api/auth/signin`, {
        email: data.email,
        password: data.password,
      });

      return user.data;
    },
    onSuccess: (_) => {
      toast(`Welcome on GURU platform`);
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response) {
          const failedResponseData = error.response
            .data as FailedServerResponsePayload;

          return toast.error(failedResponseData.title, {
            description: failedResponseData.message,
          });
        }
      }
      toast.error('Internal server error', {
        description: 'Something went wrong while registering your account.',
      });
    },
  });
};

export { useRegisterUser };
