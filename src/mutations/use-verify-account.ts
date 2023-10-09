import { User } from '@/config/db/schema';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export const useVerifyAccountMutation = () =>
  useMutation({
    retry: false,
    mutationFn: async ({ token }: { token: string }) => {
      const { data: responseData } = await axios.post<
        SuccessServerResponsePayload<User>
      >('/api/auth/verify-account', { token });

      const { data, title, message, actions } = responseData;

      toast.success(title, { description: message, duration: 3000 });

      return { data, actions };
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
        description: 'Something went wrong while verifying your account.',
      });
    },
  });
