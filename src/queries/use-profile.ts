import { AccountSetting } from '@/config/db/schema';
import { ClientUser } from '@/lib/auth';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useProfile = (enabled = true) => {
  const router = useRouter();
  // useSession({
  //   required: true,
  //   onUnauthenticated: () => {
  //     const url = new URL(window.location.href);
  //     router.push(`/sign-in?callbackUrl=${url.pathname}?${url.searchParams}`);
  //   },
  // });
  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data } = await axios.get<
        SuccessServerResponsePayload<ClientUser & { setting: AccountSetting }>
      >('/api/profile');

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
        description: 'Something went wrong while getting your profile.',
      });
    },
    staleTime: 10000,
    enabled,
  });

  return query;
};
