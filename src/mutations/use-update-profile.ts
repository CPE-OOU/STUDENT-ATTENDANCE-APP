import { SetupProfileFormData } from '@/app/(setup)/(routes)/set-up/__validator/set-up-validator';
import { ClientUser } from '@/lib/auth';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export const useSetupProfile = () => {
  return useMutation({
    retry: false,
    mutationFn: async (formData: SetupProfileFormData) => {
      const { data: responseData } = await axios.patch<
        SuccessServerResponsePayload<ClientUser>
      >(`/api/profile/set-up`, formData);

      toast.success(responseData.title, {
        description: responseData.message,
        duration: 2000,
      });
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
        description: 'An error occurred while setting up your account.',
      });
    },
  });
};
