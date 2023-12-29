import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createClientAuthTokenInfo } from '@/lib/utils';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import { toast } from 'sonner';
import { AuthAction } from '@/config/db/schema';
import { VerifyAccountSearchParams } from '@/lib/validations/params';

export const useResendAuthToken = (type: VerifyAccountSearchParams['type']) =>
  useMutation({
    mutationKey: [type],
    mutationFn: async ({ type }: { type: AuthAction }) => {
      const { data } = await axios.post<
        SuccessServerResponsePayload<
          ReturnType<typeof createClientAuthTokenInfo>
        >
      >(`/api/auth/resend-token?type=${type}`);

      return data.data;
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
