import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createClientAuthTokenInfo } from '@/lib/utils';
import { FailedServerResponsePayload } from '@/lib/response';
import { toast } from 'sonner';
import { AuthAction } from '@/config/db/schema';

export const useResendAuthToken = () =>
  useMutation({
    mutationFn: async ({ type }: { type: AuthAction }) => {
      const { data } = await axios.post<
        ReturnType<typeof createClientAuthTokenInfo>
      >(`/api/auth/resend-token?type=${type}`);

      return data;
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
        description: 'Something went wrong while resending token.',
      });
    },
  });
